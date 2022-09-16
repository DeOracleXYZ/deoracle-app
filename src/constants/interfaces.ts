import { BigNumber } from "ethers";

export interface Request {
    requestText: string;
    requestOrigin: string;
    bounty: BigNumber;
    reputation: BigNumber;
    maxAnswers: BigNumber;
    submittedAnswers: BigNumber[];
    active: boolean;
    timeStampPosted: BigNumber;
    timeStampDue: BigNumber;
}