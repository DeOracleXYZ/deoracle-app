import { ethers } from "ethers";
import { useEffect, useState } from "react";

function RequestCard(props: any) {
  const { requestData, handleClick } = props;
  const { bounty, requestText, requestOrigin, reputation, maxAnswers, active } =
    requestData;
  const [requestStatus, setRequestStatus] = useState("Inactive");
  const [shortWallet, setShortWallet] = useState("");
  const [timeStampDue, setTimeStampDue] = useState(requestData.timeStampDue);
  const [timeStampPosted, setTimeStampPosted] = useState(
    requestData.timeStampPosted
  );
  const [postedOnFinal, setPostedOnFinal] = useState("");
  const [dueDateFinal, setDueDateFinal] = useState("");

  useEffect(() => {
    active ? setRequestStatus("Active") : setRequestStatus("Inactive");

    requestOrigin
      ? setShortWallet(
          requestOrigin.substring(0, 6) + "..." + requestOrigin.slice(-4)
        )
      : setShortWallet("");

    let date1 = new Date(timeStampPosted * 1000);
    let hours1 = date1.getHours();
    let minutes1 = "0" + date1.getMinutes();
    let seconds1 = "0" + date1.getSeconds();
    let fulldate1 =
      date1.getMonth() + "." + date1.getDay() + "." + date1.getFullYear();

    let date2 = new Date(timeStampDue * 1000);
    let hours2 = date2.getHours();
    let minutes2 = "0" + date2.getMinutes();
    let seconds2 = "0" + date2.getSeconds();
    let fulldate2 =
      date2.getMonth() + "." + date2.getDay() + "." + date2.getFullYear();

    setPostedOnFinal(
      fulldate1 +
        " - " +
        hours1 +
        ":" +
        minutes1.substring(1) +
        ":" +
        seconds1.substring(1)
    );
    setDueDateFinal(
      fulldate2 +
        " - " +
        hours2 +
        ":" +
        minutes2.substring(1) +
        ":" +
        seconds2.substring(1)
    );
  }, [active, requestOrigin, timeStampDue, timeStampPosted]);

  return (
    <>
      {requestData ? (
        <div>
          <p className="text-2xl">
            <b>{requestText}</b>
          </p>
          <hr className="my-2" />
          <p>
            <b>Posted by</b> {shortWallet}
          </p>
          <p>
            <b>Bounty:</b> {ethers.utils.formatUnits(bounty, 0)} USDC
          </p>
          <p>
            <b>Req. Reputation:</b> {ethers.utils.formatUnits(reputation, 0)} RP
          </p>
          <p>
            <b>Answers:</b> 0 / {ethers.utils.formatUnits(maxAnswers, 0)}
          </p>
          <p>
            <b>Posted on:</b> {postedOnFinal}
          </p>
          <p>
            <b>Due date:</b> {dueDateFinal}
          </p>
          <p>
            <b>Status:</b> {requestStatus}
          </p>
          <br />
          <hr />
          <br />
          {/* <p className="text-xl"><b>Answers:</b></p>
            <p className="text-lg">{requestData.answers[0].answer}</p>
            <p><b>Answered by:</b> {requestData.answers[0].answerOrigin}</p>
            <p><b>Accepted Answer:</b> {requestData.answers[0].acceptedAnswer}</p>
            <p><b>Upvotes:</b> {requestData.answers[0].upVotes}</p>
            <p><b>Downvotes:</b> {requestData.answers[0].downVotes}</p>
            <hr />
            <p className="text-lg">{requestData.answers[1].answer}</p>
            <p><b>Answered by:</b> {requestData.answers[1].answerOrigin}</p>
            <p><b>Accepted Answer:</b> {requestData.answers[1].acceptedAnswer}</p>
            <p><b>Upvotes:</b> {requestData.answers[1].upVotes}</p>
            <p><b>Downvotes:</b> {requestData.answers[1].downVotes}</p> 
            <hr />*/}

          <button
            className="px-4 py-1 text-sm text-red-600 font-semibold rounded-full border border-red-200 hover:text-white hover:bg-red-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
            onClick={() => handleClick()}
          >
            {" "}
            Test Click
          </button>

          <br />
          <br />
          <hr />
          <hr />
          <hr />
          <br />
          <br />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default RequestCard;
