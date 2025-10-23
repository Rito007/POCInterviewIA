export type MessageContext = {
    role: "user" | "system" |"assistant",
    content: string
}

export default interface ClientStatus{
    context: MessageContext[]
}