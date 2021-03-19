import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
// import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import GitHubCreateIssuePayload from '../types/GitHubCreateIssuePayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext} from '../graphql'
import GitHubServerManager from '../../utils/GitHubServerManager'
import standardError from '../../utils/standardError'

const gitHubCreateIssue = {
  type: GraphQLNonNull(GitHubCreateIssuePayload),
  description: 'Create an issue in GitHub',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the meeting where the Jira issue is being created'
    },
    nameWithOwner: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The owner/repo string'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team that is creating the issue'
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the GH issue'
    }
  },
  resolve: async (
    _source,
    {
      meetingId,
      nameWithOwner,
      teamId,
      title
    }: {meetingId: string; nameWithOwner: string; teamId: string; title: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    // const r = await getRethink()
    const viewerId = getUserId(authToken)
    // const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const [repoOwner, repoName] = nameWithOwner.split('/')
    if (!repoOwner || !repoName) {
      return standardError(new Error(`${nameWithOwner} is not a valid repository`), {
        userId: viewerId
      })
    }

    // RESOLUTION
    const [viewerAuth, assigneeAuth] = await dataLoader.get('githubAuth').loadMany([
      {teamId, userId: viewerId},
      {teamId, userId: viewerId}
    ])
    const {accessToken} = viewerAuth || assigneeAuth
    const manager = new GitHubServerManager(accessToken)
    const repoInfo = await manager.getRepoInfo(nameWithOwner, assigneeAuth.login)
    if ('message' in repoInfo) {
      return {error: repoInfo}
    }
    if (!repoInfo.data || !repoInfo.data.repository || !repoInfo.data.user) {
      console.log(JSON.stringify(repoInfo))
      return {error: repoInfo.errors![0]}
    }
    const {
      data: {repository, user}
    } = repoInfo
    const {id: repositoryId} = repository
    const {id: ghAssigneeId} = user
    const createIssueRes = await manager.createIssue({
      title,
      body: '',
      repositoryId,
      assigneeIds: [ghAssigneeId]
    })
    if ('message' in createIssueRes) {
      return {error: createIssueRes}
    }

    const data = {meetingId}
    publish(SubscriptionChannel.MEETING, meetingId, 'GitHubCreateIssueSuccess', data, subOptions)
    return data
  }
}

export default gitHubCreateIssue
