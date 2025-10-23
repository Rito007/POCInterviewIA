import { Status } from "./status";

export enum TypeMessage{
    StringMessage = "StringMessage",
    AudioMessage = "AudioMessage",
    Blob = "Blob"
}

export default interface ClientMessage{
    status: Status
    type_message : TypeMessage
    message : String
}

export class ClientMessageImpl implements ClientMessage {
  status: Status;
  type_message: TypeMessage;
  message: String;

  constructor(data: ClientMessage) {
    this.status = data.status;
    this.type_message = data.type_message;
    this.message = data.message;
  }

  static fromJSON(json: unknown): ClientMessageImpl {
    if (
      typeof json === "object" &&
      json !== null &&
      "status" in json &&
      "type_message" in json &&
      "message" in json &&
      typeof (json as any).status === "string" &&
      typeof (json as any).type_message === "string" &&
      typeof (json as any).message === "string"
    ) {
      return new ClientMessageImpl(json as ClientMessage);
    }

    throw new Error("Formato inválido para ClientMessage");
  }
}
