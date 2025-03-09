import {onRequest} from "firebase-functions/v2/https";
import * as functions from "firebase-functions";
import type {Response} from "express";

const logger = functions.logger;

export const helloWorld = onRequest((request, response: Response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
