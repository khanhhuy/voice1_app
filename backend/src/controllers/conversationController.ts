import { Router } from "express";
import { defaultConversation, setConversationManager } from "@/modules/conversations/storage";
import { newConversationManager } from "@/modules/conversations/conversation_manager_factory";
import { requestContext } from "@/services/requestContext";
import Session from "@/models/Session";
import { ISession } from "@/core/types/core";
import { defaultUsage } from "@/services/usageControl";

const routes = Router();

routes.post("/", async (req, res) => {
  const user = requestContext.currentUser()

  const conversationState = defaultConversation(user.id)
  const usage = defaultUsage()

  const session = await Session.create({
    user_id: user.id,
    team_id: user.team_id,
    agent_id: 1,
    status: 'created',
    started_at: new Date(),
    data: {
      conversation: conversationState.getConversation(),
      usage,
    } satisfies ISession.Data,
    usage: {},
  })

  // const convoManager = newConversationManager(userId, convo.getConversation().sessionId, convo)
  // setConversationManager(
  //   userId,
  //   convo.getConversation().sessionId,
  //   convoManager
  // )
  // await convoManager.prepare()

  res.send({
    sessionId: session.id,
    userId: user.id,
  })
});


export { routes }