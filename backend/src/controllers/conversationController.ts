import { Router } from "express";
import { defaultConversation, setConversationManager } from "@/modules/conversations/storage";
import { newConversationManager } from "@/modules/conversations/conversation_manager_factory";
import { requestContext } from "@/services/requestContext";

const routes = Router();

routes.post("/", async (req, res) => {
  const userId = requestContext.currentUserId()

  const convo = defaultConversation(userId)

  const convoManager = newConversationManager(userId, convo.getConversation().sessionId, convo)
  setConversationManager(
    userId,
    convo.getConversation().sessionId,
    convoManager
  )
  await convoManager.prepare()

  res.send({
    sessionId: convo.getConversation().sessionId,
    userId,
  })
});


export { routes }