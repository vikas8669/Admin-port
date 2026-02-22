const apiEndPoints = import.meta.env.VITE_API_URL
console.log("meta =>>>>>>>>>......",import.meta.env.VITE_API_URL )


export const apiUrl =  {
    
    login: `${apiEndPoints}/login`,
    signUp: `${apiEndPoints}/signup`,
    verify: `${apiEndPoints}/verify`,
    adminOnly: `${apiEndPoints}/admin-only`,
    logout: `${apiEndPoints}/logout`,
    CONTACT: `${apiEndPoints}/contact`,
    getContact: `${apiEndPoints}/contact`
}