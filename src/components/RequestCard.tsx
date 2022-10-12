import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Image from "next/image";
import { kovan, mumbai } from "../constants/networks";

function RequestCard(props: any) {
  const {
    requestData,
    answerList,
    answerFormData,
    updateAnswerFormData,
    setSendAnswerState,
    sendAnswerState,
    provider,
    chainId,
    deOracleWRITE,
    deOracleREAD,
    account,
    switchNetworkKovan,
    switchNetworkMumbai,
    setNotificationMessage,
    setNotificationError,
    setDisplayNotification,
  } = props;

  const {
    id,
    bounty,
    requestText,
    origin,
    reputation,
    active,
    timeStampDue,
    timeStampPosted,
  } = requestData;

  const [requestStatus, setRequestStatus] = useState("Inactive");
  const [shortWallet, setShortWallet] = useState("");
  const [datePosted, setDatePosted] = useState("");
  const [dateDue, setDateDue] = useState("");
  const [showMe, setShowMe] = useState(false);
  const [requestOwner, setRequestOwner] = useState(false);
  const [answerIds, setAnswerIds] = useState([]);
  const [hasReward, setHasReward] = useState(false);
  const [requestENSName, setRequestENSName] = useState("" as string | null);
  const [answerOriginToENS, setAnswerOriginToENS]: [any, any] = useState({});
  const [ENSFetched, setENSFetched] = useState(false);
  const [chainOrigin, setChainOrigin] = useState<any>();
  const mainNetProvider = new ethers.providers.AlchemyProvider(
    1,
    "vd1ojdJ9UmyBbiKOxpWVnGhDpoFVVxBY"
  );

  let localAnswersTemp: any = [];

  function toggle() {
    setShowMe(!showMe);
  }

  useEffect(() => {
    id.toNumber() < 1869622600 ? setChainOrigin(kovan) : setChainOrigin(mumbai);
  }, []);

  useEffect(() => {
    async function getENSNames() {
      let ENS: string | null;
      answerList.map(async (answerArray: any) => {
        ENS = await checkENS(answerArray.origin);
        setAnswerOriginToENS((prevState: any) => ({
          ...prevState,
          [answerArray.origin]: ENS,
        }));
      });
    }

    if (Object.keys(answerList).length > 0) {
      getENSNames();
      setENSFetched(true);
    }
    async function checkENS(origin: string) {
      const ENS = await mainNetProvider.lookupAddress(origin);
      return ENS;
    }

    const checkENSName = async () => {
      setRequestENSName(await checkENS(origin));
    };

    checkENSName();
  }, [deOracleREAD]);

  useEffect(() => {
    active
      ? setRequestStatus("bg-green-400 dark:bg-green-400/60")
      : setRequestStatus("bg-red-400 dark:bg-red-400/60");

    requestENSName
      ? setShortWallet(requestENSName)
      : setShortWallet(origin.substring(0, 6) + "..." + origin.slice(-4));

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let datePosted = new Intl.DateTimeFormat("en-GB", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: timezone,
    }).format(new Date(timeStampPosted.toNumber() * 1000));

    let dateDue = new Intl.DateTimeFormat("en-GB", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: timezone,
    }).format(new Date(timeStampDue.toNumber() * 1000));

    account && origin
      ? origin == account
        ? setRequestOwner(true)
        : setRequestOwner(false)
      : setRequestOwner(false);

    setDatePosted(datePosted);
    setDateDue(dateDue);
  }, [answerList]);

  useEffect(() => {
    const getAnswerIds = async () => {
      let idNum = await id.toNumber();
      setAnswerIds(await deOracleREAD.getRequestIdToAnswerIds(idNum));
    };

    deOracleREAD && getAnswerIds();
  }, [deOracleREAD]);

  useEffect(() => {
    answerList &&
      answerIds &&
      answerList.map(function (answer: any, index: any) {
        if (answer.requestId.toNumber() == id.toNumber()) {
          if (answer.rewarded) {
            setHasReward(true);
          }
        }
      });
  }, [answerList]);

  const handleChange = (event: any) => {
    const requestId = id.toNumber();
    updateAnswerFormData((prevData: any) => {
      return {
        answerText: event.target.value,
        requestId: requestId,
      };
    });
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    sendAnswer(answerFormData, event);
  };

  async function sendAnswer(answerData: any, event: any) {
    const { requestId, answerText } = answerData;
    let txReceipt;
    const input = event.target.firstChild.firstChild;
    const button = event.target.firstChild.lastChild;
    const spinner = event.target.lastChild;

    if (deOracleWRITE)
      try {
        txReceipt = await deOracleWRITE.postAnswer(requestId, answerText);
      } catch (err: any) {
        setNotificationError(true);
        setNotificationMessage(err.reason);
        setDisplayNotification(true);
        return;
      }

    // disable answer input & button and show loading
    input.setAttribute("disabled", "true");
    button.setAttribute("disabled", "true");
    spinner.classList.remove("hidden");
    txReceipt = await txReceipt.wait();

    if (txReceipt.status === 1) {
      // enable answer input & button and hide loading
      input.removeAttribute("disabled");
      button.removeAttribute("disabled");
      spinner.classList.add("hidden");
      input.value = "";
      setSendAnswerState((previousState: any) => !previousState);

      // show Create Request button
    } else {
      console.log("Approve tx Failed, check Metamask and try again.");
    }
  }

  const upVoteAnswer = async (event: any) => {
    try {
      let txReceipt = await deOracleWRITE.upVote(event.currentTarget.name);
    } catch (err: any) {
      setNotificationError(true);
      setNotificationMessage(err.reason);
      setDisplayNotification(true);
    }
  };

  const downVoteAnswer = async (event: any) => {
    try {
      let txReceipt = await deOracleWRITE.downVote(event.currentTarget.name);
    } catch (err: any) {
      setNotificationError(true);
      setNotificationMessage(err.reason);
      setDisplayNotification(true);
    }
  };

  function handleSwitchNetwork() {
    chainOrigin == mumbai ? switchNetworkMumbai() : switchNetworkKovan();
  }

  const acceptAnswer = (event: any) => {
    try {
      event.currentTarget.name &&
        deOracleWRITE.selectAnswer(event.currentTarget.name);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      {requestData ? (
        <div className="request-box mb-3">
          <p className="text-xl md:text-2xl pt-4 pb-3 px-5 dark:text-slate-300">
            <span className="inline-block align-[-5px] opacity-60">
              <Image width="24px" height="24px" src="logo-polygon.svg" />
            </span>
            <b className="pl-4">{requestText}</b>
          </p>
          <hr className="my-2" />
          <div className="request-info flex flex-nowrap overflow-scroll gap-5 justify-between text-purple-500 dark:text-purple-500/75 text-sm px-5 pt-2 pb-3">
            <p className="whitespace-nowrap">
              <b>Bounty:</b>
              <br /> {parseInt(ethers.utils.formatUnits(bounty, 18))} USDC
            </p>
            <p className="whitespace-nowrap">
              <b>Req. Reputation:</b>
              <br /> {ethers.utils.formatUnits(reputation, 0)} RP
            </p>
            <p className="whitespace-nowrap">
              <b>Due Date:</b>
              <br />{" "}
              <span className="text-xs">
                {" "}
                <span
                  className={
                    "w-2 h-2 " +
                    `${requestStatus}` +
                    " bg-" +
                    `${requestStatus}` +
                    "-300 mr-1 rounded inline-block"
                  }
                ></span>{" "}
                {active ? dateDue : "Completed"}
              </span>
            </p>
            <p className="whitespace-nowrap">
              <b>Posted by:</b>
              <br />
              <a
                href={
                  chainId === 69
                    ? "https://kovan-optimistic.etherscan.io/address/" +
                      `${origin}`
                    : "https://mumbai.polygonscan.com/address/" + `${origin}`
                }
                className="underline hover:no-underline hover:text-purple-400"
                target="_blank"
                rel="noreferrer"
              >
                <span className="text-xs">
                  {requestENSName ? requestENSName : shortWallet}
                </span>
              </a>
            </p>
            <p className="whitespace-nowrap">
              <b>Posted on:</b>
              <br /> <span className="text-xs">{datePosted}</span>
            </p>
          </div>

          <div
            className="w-full bg-slate-50 dark:bg-slate-800/75 border-t border-purple-300/50 dark:border-purple-300/20 shadow-inner"
            style={{ borderRadius: "0 0 15px 15px" }}
          >
            <div className={`${!showMe ? "hidden" : ""}` + " px-5 py-5"}>
              {answerList &&
                answerList.map(function (answer: any) {
                  if (answer.requestId.toNumber() == id.toNumber())
                    return (
                      <div
                        key={answer.id.toNumber()}
                        className="border-b border-slate-200 dark:border-white/10 flex flex-wrap md:flex-nowrap gap-5 text-sm py-3 items-center"
                      >
                        <div className="flex-none font-bold w-full md:w-auto">
                          <p className="">
                            <button
                              name={answer.id.toNumber()}
                              onClick={upVoteAnswer}
                              className="rounded-l-xl px-3 py-2 border-2 border-green-400 dark:border-green-400/70 dark:hover:border-green-500/70  text-green-400 hover:border-green-500 hover:text-green-500 dark:bg-slate-900"
                            >
                              +{answer.upVotes.toNumber()}
                            </button>
                            <button
                              name={answer.id.toNumber()}
                              onClick={acceptAnswer}
                              className={
                                `${requestOwner ? " " : "hidden "}` +
                                `${hasReward ? "hidden " : " "}` +
                                " px-3 py-2 border-2 border-blue-400 dark:border-blue-400/70 dark:hover:border-blue-500/70 text-blue-400 hover:border-blue-500 hover:text-blue-500 dark:bg-slate-900"
                              }
                              title="Accept Answer"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className="w-4 h-4 inline-block"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </button>
                            <button
                              name={answer.id.toNumber()}
                              onClick={downVoteAnswer}
                              className="rounded-r-xl px-3 py-2 dark:bg-slate-900 border-2 border-red-400 dark:border-red-400/70 dark:hover:border-red-500/70 text-red-400 hover:border-red-500 hover:text-red-500"
                            >
                              -{answer.downVotes.toNumber()}
                            </button>
                          </p>
                        </div>
                        <div className="grow w-full md:w-auto dark:text-slate-300">
                          <p className="text-base md:text-lg font-bold">
                            {answer.answerText}
                          </p>
                          <p
                            className={
                              `${answer.rewarded ? "" : "hidden"}` +
                              " mt-2 text-blue-500 text-xs text-left"
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              stroke="currentColor"
                              className="w-4 h-4 inline-block align-middle"
                              style={{ marginTop: "-1.5px" }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>{" "}
                            Accepted Answer
                          </p>
                        </div>
                        <p className="text-xs text-slate-400 text-left md:text-right w-full md:w-auto">
                          <b>Answered by:</b>{" "}
                          <a
                            href={
                              "https://mumbai.polygonscan.com/address/" +
                              answer.origin
                            }
                            className="underline hover:no-underline hover:text-slate-500"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {ENSFetched && answerOriginToENS[answer.origin]
                              ? answerOriginToENS[answer.origin]
                              : answer.origin.substring(0, 6) +
                                "..." +
                                answer.origin.slice(-4)}
                          </a>
                        </p>
                      </div>
                    );
                })}
              <form onSubmit={handleSubmit}>
                <div className="flex gap-0 justify-between text-purple-500 py-3 relative">
                  <input
                    type="text"
                    name="newAnswer1"
                    onChange={handleChange}
                    required
                    placeholder="Your answer..."
                    className="w-full pl-4 pr-24 py-3 rounded-full border border-purple-300  hover:border-purple-400 dark:border-purple-300/50 dark:hover:border-purple-400/80 dark:bg-slate-900 focus:outline-purple-500 dark:focus:outline-purple-400/80 dark:focus:outline-none dark:focus:outline-2 placeholder:text-purple-300 dark:placeholder:text-purple-300/40"
                    style={{ outlineOffset: "0" }}
                  />
                  <button
                    type="submit"
                    className="absolute right-0 px-5 border rounded-full drop-shadow-lg align-middle px-6 py-4 text-purple-600 dark:text-white/60 dark:hover:text-white/80 font-semibold border-purple-400 bg-gradient-to-r from-purple-200 via-blue-200 to-purple-200 dark:from-purple-600/80 dark:via-blue-600/80 dark:to-purple-600/80 hover:border-purple-500 hover:text-purple-700 transition-all ease-in-out duration-500 bg-size-200 bg-pos-0 hover:bg-pos-100 disabled:opacity-60"
                    style={{ paddingTop: "12px", paddingBottom: "12px" }}
                  >
                    Send
                  </button>
                </div>

                <div className="grid hidden">
                  <div className="place-self-end inline whitespace-nowrap">
                    <svg
                      className="animate-spin ml-1 mr-3 h-5 w-5 text-purple-400 inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-purple-600">Processing...</span>
                  </div>
                </div>
              </form>
            </div>

            <div className="text-center">
              {
                <button
                  className={
                    "w-full py-5 px-5 text-sm text-black font-semibold underline-offset-4 underline decoration-1 hover:text-slate-700 border-t border-transparent hover:no-underline bg-slate-100/50 hover:bg-slate-50/25 dark:bg-slate-800/50 dark:hover:bg-slate-800/25 dark:text-slate-500 dark:hover:text-slate-400" +
                    `${
                      showMe
                        ? " hover:border-slate-200 dark:hover:border-slate-700"
                        : ""
                    }`
                  }
                  style={{ borderRadius: "0 0 15px 15px" }}
                  onClick={toggle}
                >
                  <>
                    <span className={`${showMe ? "hidden" : ""}`}>Show </span>
                    <span className={`${!showMe ? "hidden" : ""}`}>Hide </span>
                    answers ({answerIds.length})
                  </>
                </button>

                //commented out optimism switch
                //   <button
                //   className={
                //     "w-full py-5 px-5 text-sm text-black font-semibold underline-offset-4 underline decoration-1 hover:text-slate-700 border-t border-transparent hover:no-underline bg-slate-100/50 hover:bg-slate-50/25 dark:bg-slate-800/50 dark:hover:bg-slate-800/25 dark:text-slate-500 dark:hover:text-slate-400" +
                //     `${showMe ? " hover:border-slate-200 dark:hover:border-slate-700" : ""}`
                //   }
                //   style={{ borderRadius: "0 0 15px 15px" }}
                //   onClick={handleSwitchNetwork}
                // >

                //   <>
                //   <p>Switch Networks</p>
                //   </>
                //   </button>
              }
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default RequestCard;
