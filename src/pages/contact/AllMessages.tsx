import ContactTable from "./components/ContactTable"

const AllMessages = () => {
  return (
    <ContactTable 
      statusFilter="All"
      title="All Messages"
      description="View and manage all incoming inquiries from your contact form."
    />
  )
}

export default AllMessages
