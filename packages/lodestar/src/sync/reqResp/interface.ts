/**
 * @module sync
 */

import PeerId from "peer-id";
import {RequestBody} from "@chainsafe/lodestar-types";

import {Method, RequestId} from "../../constants";

/**
 * The IReqRespHandler module handles app-level requests / responses from other peers,
 * fetching state from the chain and database as needed.
 */
export interface IReqRespHandler {
  start: () => Promise<void>;
  stop: () => Promise<void>;

  onRequest: (peerId: PeerId, method: Method, id: RequestId, body: RequestBody) => Promise<void>;
}