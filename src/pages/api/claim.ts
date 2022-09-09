import apiReq from '../../lib/fetcher'
import { NextApiRequest, NextApiResponse } from 'next';
import { VerificationResponse } from '@worldcoin/id';


const POAP_URL = "https://welook.io/mint/cwb8p5"

type RequestBody = VerificationResponse & { signal: string }

const action_id = process.env.NEXT_PUBLIC_ACTION_ID

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { signal, merkle_root, nullifier_hash, proof }: RequestBody = req.body;

  const verificationResponse = await apiReq("https://developer.worldcoin.org/api/v1/verify", {
    signal: "test",
    action_id: "wid_staging_9090ad0f7598ba4634bdc979a101cbcc",
    merkle_root,
    nullifier_hash,
    proof, })

    if (verificationResponse.ok) {
      return res.status(200).json({ success: true })
    }
    console.log(res)
   return res.status(400).json({ success: false})
}

export default handler