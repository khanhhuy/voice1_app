import { Router } from "express";
import { defaultConversation, setConversation, setConversationManager } from "@/modules/conversations/storage";
import { newConversationManager } from "@/modules/conversations/conversation_manager_factory";
import { requestContext } from "@/services/requestContext";

const routes = Router();

routes.post("/", (req, res) => {
  const userId = requestContext.currentUserId()

  const convo = defaultConversation(userId)
  setConversation(userId, convo)

  const convoManager = newConversationManager(userId, convo.getConversation().sessionId, convo)
  setConversationManager(
    userId,
    convo.getConversation().sessionId,
    convoManager
  )

  res.send({
    sessionId: convo.getConversation().sessionId,
    userId,
  })
});


export { routes }