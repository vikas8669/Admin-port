import ContactTable from "./components/ContactTable"

const RepliedMessages = () => {
  return (
    <ContactTable 
      statusFilter="Replied"
      title="Replied Messages"
      description="Review your previous responses and follow up with clients."
    />
  )
}

export default RepliedMessages
