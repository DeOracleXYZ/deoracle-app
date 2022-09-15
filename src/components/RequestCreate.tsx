import { useState } from "react";
import Image from "next/image";

function RequestCreate(props: any) {
  const { handleClick, account } = props;

  const [showMe, setShowMe] = useState(false);

  function toggle() {
    setShowMe(!showMe);
  }

  type requestSubmission = [
    requestText: string,
    requestOrigin: string,
    bounty: number,
    reputation: number,
    maxAnswers: number,
    submittedAnswers: number,
    active: boolean,
    timeStampPosted: number,
    timeStampDue: number
  ];

  function onSubmit() {
    // val1 ,va2
    let newRequestText = document.getElementById("newRequestText").value;
    let newBounty = document.getElementById("newBounty").value;
    let newMinReputation = document.getElementById("newMinReputation").value;
    let newNoOfAnswers = document.getElementById("newNoOfAnswers").value;
    let newDueDate = document.getElementById("newDueDate").value;

    console.log(
      newRequestText +
        " " +
        newBounty +
        " " +
        newMinReputation +
        " " +
        newNoOfAnswers +
        " " +
        newDueDate
    );

    // handleClick(newRequestText, newBounty, newMinReputation, newNoOfAnswers, newDueDate);
  }

  return (
    <div className="w-full rounded-2xl mb-3 border-2 border-purple-300 text-black hover:border-purple-400">
      <button
        className={
          `${showMe ? "hidden" : ""}` +
          " new-request-button w-full px-5 py-5 text-center text-purple-400 hover:text-purple-500 hover:bg-purple-100"
        }
        onClick={toggle}
      >
        NEW REQUEST
      </button>

      <header
        className={
          `${!showMe ? "hidden" : ""}` +
          " w-full px-5 text-left grid grid-cols-2"
        }
      >
        <div className="col-1">
          <p className="new-request-header text-purple-500 text-2xl px-4 py-5">
            New Request
          </p>
        </div>

        <div className="col-1 text-right">
          <button onClick={toggle} className="px-4 pt-5 pb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#c690ff"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="col-span-2">
          <hr />
        </div>
      </header>

      <div
        className={
          `${!showMe ? "hidden" : ""}` + " grid grid-cols-2 grid-flow-col gap-4"
        }
      >
        <div className="col-1 px-8 py-8">
          <form action="/send-data-here" method="post">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="mb-2">
                  <label className="pl-2">
                    <b>Request:</b>
                  </label>
                  <br />
                  <textarea
                    id="newRequestText"
                    name="newRequestText"
                    placeholder="Type in your request..."
                    required
                    minLength={10}
                    rows={4}
                    className="w-full mt-1 border border-purple-300 px-4 py-3  rounded-lg"
                  />
                </div>
              </div>

              <div className="col-1">
                <div className="col-1">
                  <label className="pl-2">
                    <b>Bounty (USDC):</b>
                  </label>
                  <br />
                  <input
                    type="number"
                    id="newBounty"
                    name="newBounty"
                    required
                    placeholder="i.e. 100"
                    minLength={1}
                    className="w-full mt-1 border border-purple-300 px-4 py-3 rounded-lg  mb-5"
                  />
                </div>

                <div className="col-1">
                  <label className="pl-2">
                    <b>Min. Reputation (RP):</b>
                  </label>
                  <br />
                  <input
                    type="number"
                    id="newMinReputation"
                    name="newMinReputation"
                    required
                    placeholder="i.e. 100"
                    minLength={1}
                    className="w-full mt-1 border border-purple-300 px-4 py-3  rounded-lg border-purple-300 mb-5"
                  />
                </div>
              </div>

              <div className="col-1">
                <div className="col-1">
                  <label className="pl-2">
                    <b>Min. No. of Answers:</b>
                  </label>
                  <br />
                  <input
                    type="number"
                    id="newNoOfAnswers"
                    name="newNoOfAnswers"
                    required
                    placeholder="i.e. 1"
                    minLength={1}
                    className="w-full mt-1 border border-purple-300 px-4 py-3 rounded-lg mb-5"
                  />
                </div>

                <div className="col-1">
                  <label className="pl-2">
                    <b>Due Date (CET):</b>
                  </label>
                  <br />
                  <input
                    type="datetime-local"
                    id="newDueDate"
                    name="newDueDate"
                    required
                    placeholder="09.09.2029"
                    className="w-full mt-1 border border-purple-300 px-4 py-3 rounded-lg mb-5"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <button
                  onClick={() => onSubmit()}
                  type="submit"
                  className="border px-1 py-2 align-middle px-6 py-3 text-purple-600 font-semibold rounded-full border-purple-400 bg-gradient-to-r from-purple-100 from-purple-300 hover:bg-gradient-to-l hover:border-purple-500 hover:text-purple-700 rounded-lg"
                >
                  Create Request
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="col-1 px-5 py-5 flex place-content-center">
          <Image
            style={{ zIndex: -1 }}
            className="self-center"
            src="eyeball.svg"
            alt="eyeball image"
            width={300}
            height={300}
          ></Image>
        </div>
      </div>
    </div>
  );
}

export default RequestCreate;
