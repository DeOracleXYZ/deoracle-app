import { ethers } from "ethers";
import { withCoalescedInvoke } from "next/dist/lib/coalesced-function";
import { useEffect, useState } from "react";

function RequestCard(props: any) {
  const {
    requestData,
    answerList,
    handleClickAnswer,
    answerFormData,
    updateAnswerFormData,
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

  function toggle() {
    setShowMe(!showMe);
  }

  useEffect(() => {
    active ? setRequestStatus("green") : setRequestStatus("red");

    origin
      ? setShortWallet(origin.substring(0, 6) + "..." + origin.slice(-4))
      : setShortWallet("");

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

    setDatePosted(datePosted);
    setDateDue(dateDue);
  }, [active, origin, timeStampDue, timeStampPosted, id]);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    handleClickAnswer(answerFormData);
  };

  const handleChange = (event: any) => {
    const requestId = id.toNumber();
    updateAnswerFormData((prevData: any) => {
      return {
        answerText: event.target.value,
        requestId: requestId,
      };
    });
  };

  return (
    <>
      {requestData ? (
        <div className="request-box mb-3">
          <p className="text-xl md:text-2xl pt-5 pb-3 px-5">
            <b>{requestText}</b>
          </p>
          <hr className="my-2" />
          <div className="request-info flex flex-nowrap overflow-scroll gap-5 justify-between text-purple-500 text-sm px-5 pt-2 pb-3">
            <p className="whitespace-nowrap">
              <b>Bounty:</b>
              <br /> {ethers.utils.formatUnits(bounty, 0)} USDC
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
                {dateDue}
              </span>
            </p>
            <p className="whitespace-nowrap">
              <b>Posted by:</b>
              <br />
              <a
                href={"https://mumbai.polygonscan.com/address/" + `${origin}`}
                className="underline hover:no-underline hover:text-purple-400"
                target="_blank"
                rel="noreferrer"
              >
                <span className="text-xs">{shortWallet}</span>
              </a>
            </p>
            <p className="whitespace-nowrap">
              <b>Posted on:</b>
              <br /> <span className="text-xs">{datePosted}</span>
            </p>
          </div>

          <div
            className="w-full bg-slate-100 border-t border-purple-200 shadow-inner"
            style={{ borderRadius: "0 0 15px 15px" }}
          >
            <div className={`${!showMe ? "hidden" : ""}` + " px-5 py-5"}>
              {answerList &&
                answerList.map(function (answer: any) {
                  if (answer.requestId.toNumber() == id.toNumber()) {
                    // setCountAnswersForRequest(countAnswersForRequest+1)

                    return (
                      <div
                        key={answer.id.toNumber()}
                        className="border-b border-slate-200 flex flex-wrap md:flex-nowrap gap-5 text-sm py-3 items-center"
                      >
                        {/* <p><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="inline w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> <b>Accepted Answer</b></p> */}
                        <p className="font-bold flex-none">
                          <button className="rounded-l-xl px-3 py-1 border-2 border-green-400 text-green-400 hover:border-green-500 hover:text-green-500">
                            +{answer.downVotes.toNumber()}
                          </button>
                          <button className="rounded-r-xl px-3 py-1 border-2 border-red-400 text-red-400 hover:border-red-500 hover:text-red-500">
                            -{answer.upVotes.toNumber()}
                          </button>
                        </p>
                        <p className="text-base md:text-lg font-bold grow">
                          {answer.answerText}
                        </p>
                        <p className="text-xs text-slate-400">
                          <b>Answered by:</b>{" "}
                          <a
                            href={
                              "https://mumbai.polygonscan.com/address/" +
                              `${answer.origin}`
                            }
                            className="underline hover:no-underline hover:text-slate-500"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {answer.origin.substring(0, 6) +
                              "..." +
                              answer.origin.slice(-4)}
                          </a>
                        </p>
                      </div>
                    );
                  }
                })}

              <form onSubmit={handleSubmit}>
                <div className="flex gap-0 justify-between text-purple-500 py-3 relative">
                  <input
                    type="text"
                    name="newAnswer1"
                    onChange={handleChange}
                    required
                    placeholder="Your answer..."
                    className="w-full border border-purple-300 pl-4 pr-24 py-3 hover:border-purple-400 outline-purple-500 rounded-full"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 border px-5 py-3 text-purple-600 font-semibold rounded-full border-purple-400 bg-gradient-to-r from-purple-100 from-purple-300 hover:bg-gradient-to-l hover:border-purple-500 hover:text-purple-700"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>

            <div className="text-center">
              <button
                className={
                  "w-full py-5 px-5 text-sm text-black font-semibold underline-offset-4 underline decoration-1 hover:text-slate-700 border-t border-transparent hover:no-underline hover:bg-slate-50 " +
                  `${showMe ? " hover:border-slate-200" : ""}`
                }
                style={{ borderRadius: "0 0 15px 15px" }}
                onClick={toggle}
              >
                <span className={`${showMe ? "hidden" : ""}`}>Show</span>{" "}
                <span className={`${!showMe ? "hidden" : ""}`}>Hide</span>{" "}
                answers
                {/* answers (0) */}
              </button>
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
