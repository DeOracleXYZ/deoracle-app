import { ethers } from "ethers";
import { useEffect, useState } from "react";

function RequestCard(props: any) {
  const { requestData, handleClick } = props;
  const { bounty, requestText, requestOrigin, reputation, maxAnswers, active } =
    requestData;
    console.log(requestData);
  const [requestStatus, setRequestStatus] = useState("Inactive");
  const [shortWallet, setShortWallet] = useState("");
  const [timeStampDue, setTimeStampDue] = useState(requestData.timeStampDue);
  const [timeStampPosted, setTimeStampPosted] = useState(
    requestData.timeStampPosted
  );
  const [postedOnFinal, setPostedOnFinal] = useState("");
  const [dueDateFinal, setDueDateFinal] = useState("");
  const [showMe, setShowMe] = useState(false);

    function toggle(){
        setShowMe(!showMe);
    }

  useEffect(() => {
    active ? setRequestStatus("Active") : setRequestStatus("Inactive");

    requestOrigin
      ? setShortWallet(
          requestOrigin.substring(0, 6) + "..." + requestOrigin.slice(-4)
        )
      : setShortWallet("");


    // TODO: Fix display of due date
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
        <div className="request-box mb-3">
          <p className="text-2xl pt-5 pb-3 px-5">
            <b>{requestText}</b>
          </p>
          <hr className="my-2" />
          <div className="request-info flex flex-nowrap overflow-scroll gap-5 justify-between text-purple-500 text-sm px-5 pt-2 pb-3">
            <p className="whitespace-nowrap"><b>Posted by</b><br /> {shortWallet}</p>
            <p className="whitespace-nowrap"><b>Bounty:</b><br /> {ethers.utils.formatUnits(bounty, 0)} USDC</p>
            <p className="whitespace-nowrap"><b>Req. Reputation:</b><br /> {ethers.utils.formatUnits(reputation, 0)} RP</p>
            <p className="whitespace-nowrap"><b>Answers:</b><br /> 0 / {ethers.utils.formatUnits(maxAnswers, 0)}</p>
            <p className="whitespace-nowrap"><b>Posted on:</b><br /> {postedOnFinal}</p>
            <p className="whitespace-nowrap"><b>Due date:</b><br /> {dueDateFinal}</p>
            <p className="whitespace-nowrap"><b>Status:</b><br /> {requestStatus}</p>
          </div>
          
            <div className="w-full bg-slate-100 border-t border-purple-200 shadow-inner" style={{borderRadius: "0 0 15px 15px"}}>

                <div className={`${ !showMe ? "hidden" : "" }` + " px-5 py-5"}>

                    <div className="border-b border-slate-200 flex gap-5 text-sm py-3 items-center">
                        <p><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="inline w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> <b>Accepted Answer</b></p>
                        <p className="text-lg font-bold grow">10.000</p>
                        <p className="justify-self-end font-bold">
                            <button className="rounded-l-xl px-3 py-1 border-2 border-green-400 text-green-400 hover:border-green-500 hover:text-green-500">+11</button>
                            <button className="rounded-r-xl px-3 py-1 border-2 border-red-400 text-red-400 hover:border-red-500 hover:text-red-500">-2</button>
                        </p>
                        <p className="justify-self-end"><b>Answered by:</b> 0x45x9...45b9</p>
                    </div>

                    <div className="border-b border-slate-200 flex gap-5 text-sm py-3 items-center">
                        <p className="invisible"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="inline w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> <b>Accepted Answer</b></p>
                        <p className="text-lg font-bold grow">1.000</p>
                        <p className="justify-self-end font-bold">
                            <button className="rounded-l-xl px-3 py-1 border-2 border-green-400 text-green-400 hover:border-green-500 hover:text-green-500">+11</button>
                            <button className="rounded-r-xl px-3 py-1 border-2 border-red-400 text-red-400 hover:border-red-500 hover:text-red-500">-2</button>
                        </p>
                        <p className="justify-self-end"><b>Answered by:</b> 0x11b1...39c3</p>
                    </div>

                    <div className="flex gap-0 justify-between text-purple-500 py-3 relative">
                        <input type="text" id="newAnswer1" name="newAnswer1" required placeholder="Your answer..." className="w-full border border-purple-300 pl-4 pr-24 py-3 hover:border-purple-400 outline-purple-500 rounded-full" /> 
                        <button type="submit" className="absolute right-0 border px-5 py-3 text-purple-600 font-semibold rounded-full border-purple-400 bg-gradient-to-r from-purple-100 from-purple-300 hover:bg-gradient-to-l hover:border-purple-500 hover:text-purple-700">Send</button>
                    </div>

                </div>

                <div className="text-center">
                    <button className={"w-full py-5 px-5 text-sm text-black font-semibold underline-offset-4 underline decoration-1 hover:text-slate-700 border-t border-transparent hover:no-underline hover:bg-slate-50 " + `${ showMe ? " hover:border-slate-200" : "" }`} style={{borderRadius: "0 0 15px 15px"}} onClick={toggle}><span className={`${ showMe ? "hidden" : "" }`}>Show</span> <span className={`${ !showMe ? "hidden" : "" }`}>Hide</span> answers (2)</button>
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
