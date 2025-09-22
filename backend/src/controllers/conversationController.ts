import { Router } from "express";
import { defaultConversation, setConversationManager } from "@/modules/conversations/storage";
import { newConversationManager } from "@/modules/conversations/conversationManagerFactory";
import { requestContext } from "@/services/requestContext";
import Session from "@/models/Session";
import { ISession } from "@/core/types/core";
import { defaultUsage } from "@/modules/usage/usageControl";
import { omit } from "lodash";
import { V1_QUOTA } from "@/modules/usage/quota";

const routes = Router();

routes.post("/", async (req, res) => {
  const user = requestContext.currentUser()

  const PLACEHOLDER_SESSION_ID = '-1'

  const conversationState = defaultConversation(user.id, PLACEHOLDER_SESSION_ID)
  const usage = defaultUsage()

  const session = await Session.create({
    user_id: user.id,
    team_id: user.team_id,
    agent_id: 1,
    status: 'created',
    started_at: new Date(),
    data: {
      conversation: omit(conversationState.getConversation(), 'sessionId', 'userId'),
      usage,
    } satisfies ISession.Data,
    usage: {},
  })

  conversationState.updateSessionId(session.id)

  const convoManager = newConversationManager(conversationState, usage, V1_QUOTA)
  setConversationManager(
    user.id,
    convoManager
  )
  await convoManager.prepare()

  res.send({
    sessionId: session.id,
    userId: user.id,
  })
});


export { routes }