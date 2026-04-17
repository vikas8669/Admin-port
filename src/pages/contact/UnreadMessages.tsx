import ContactTable from "./components/ContactTable"

const UnreadMessages = () => {
  return (
    <ContactTable 
      statusFilter="Unread"
      title="Unread Messages"
      description="Keep track of new inquiries that need your attention."
    />
  )
}

export default UnreadMessages
