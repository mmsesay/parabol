// import {NewMeetingSidebarPhaseList_viewer} from '__generated__/NewMeetingSidebarPhaseList_viewer.graphql'
// import React from 'react'
// import styled from 'react-emotion'
// import {commitLocalUpdate, createFragmentContainer, graphql} from 'react-relay'
// import NewMeetingSidebarPhaseListItem from 'universal/components/NewMeetingSidebarPhaseListItem'
// import NewMeetingSidebarPhaseListItemChildren from 'universal/components/NewMeetingSidebarPhaseListItemChildren'
// import withAtmosphere, {
//   WithAtmosphereProps
// } from 'universal/decorators/withAtmosphere/withAtmosphere'
// import {useGotoStageId} from 'universal/hooks/useMeeting'
// import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'universal/types/graphql'
// import {AGENDA_ITEMS, DISCUSS, LOBBY} from 'universal/utils/constants'
// import getSidebarItemStage from 'universal/utils/getSidebarItemStage'
// import findStageById from 'universal/utils/meetings/findStageById'
// import {phaseTypeToPhaseGroup} from 'universal/utils/meetings/lookups'
// import sidebarCanAutoCollapse from 'universal/utils/meetings/sidebarCanAutoCollapse'
// import UNSTARTED_MEETING from '../utils/meetings/unstartedMeeting'
//
//
// interface Props extends WithAtmosphereProps {
//   gotoStageId: ReturnType<typeof useGotoStageId>
//   meetingType: MeetingTypeEnum
//   phaseTypes: ReadonlyArray<NewMeetingPhaseTypeEnum>
//   toggleSidebar: () => void
//   viewer: NewMeetingSidebarPhaseList_viewer
// }
//
// const blackList = [NewMeetingPhaseTypeEnum.firstcall, NewMeetingPhaseTypeEnum.lastcall]
//
// const NewMeetingSidebarPhaseList = (props: Props) => {
//   const {gotoStageId, meetingType, phaseTypes, toggleSidebar, viewer} = props
//   const {viewerId, team} = viewer
//   const {newMeeting} = team!
//   const meeting = newMeeting || UNSTARTED_MEETING
//   const {facilitatorUserId, facilitatorStageId, localPhase, phases} = meeting
//   const localGroup = phaseTypeToPhaseGroup[localPhase && localPhase.phaseType]
//   const facilitatorStageRes = findStageById(phases, facilitatorStageId)
//   const {phase: facilitatorPhase = {phaseType: LOBBY}} = facilitatorStageRes || {}
//   const facilitatorPhaseGroup = phaseTypeToPhaseGroup[facilitatorPhase.phaseType]
//   const isViewerFacilitator = facilitatorUserId === viewerId
//   return (
//     <NavList>
//       {phaseTypes
//         .filter((phaseType) => !blackList.includes(phaseType))
//         .map((phaseType, idx) => {
//           const itemStage = getSidebarItemStage(phaseType, phases, facilitatorStageId)
//           const {id: itemStageId = '', isNavigable = false, isNavigableByFacilitator = false} =
//             itemStage || {}
//           const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
//           const handleClick = () => {
//             gotoStageId(itemStageId).catch()
//             if (sidebarCanAutoCollapse()) toggleSidebar()
//           }
//           // when a primary nav item has sub-items, we want to show the sub-items as active, not the parent (TA)
//           // const activeHasSubItems = phaseType === DISCUSS || phaseType === AGENDA_ITEMS
//           return (
//             <NewMeetingSidebarPhaseListItem
//               key={phaseType}
//               phaseType={phaseType}
//               listPrefix={String(idx + 1)}
//               isActive={!children && localGroup === phaseType}
//               isFacilitatorPhaseGroup={facilitatorPhaseGroup === phaseType}
//               handleClick={canNavigate ? handleClick : undefined}
//             >
//               <NewMeetingSidebarPhaseListItemChildren
//                 gotoStageId={gotoStageId}
//                 meetingType={meetingType}
//                 phaseType={phaseType}
//                 viewer={viewer}
//               />
//             </NewMeetingSidebarPhaseListItem>
//           )
//         })}
//     </NavList>
//   )
// }
//
// export default createFragmentContainer(
//   withAtmosphere(NewMeetingSidebarPhaseList),
//   graphql`
//     fragment NewMeetingSidebarPhaseList_viewer on User {
//       ...NewMeetingSidebarPhaseListItemChildren_viewer
//       viewerId: id
//       team(teamId: $teamId) {
//         isMeetingSidebarCollapsed
//         id
//         newMeeting {
//           meetingId: id
//           facilitatorUserId
//           facilitatorStageId
//           localPhase {
//             phaseType
//           }
//           phases {
//             phaseType
//             stages {
//               id
//               isComplete
//               isNavigable
//               isNavigableByFacilitator
//             }
//           }
//         }
//       }
//     }
//   `
// )
