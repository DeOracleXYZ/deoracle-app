
import { ethers } from 'ethers';


function RequestCard(props: any) {


    const { requestData } = props;
    const { bounty, requestText, requestOrigin, reputation, maxAnswers, timeStampPosted,timeStampDue, active } = requestData;




    let requestStatus;
    (active) ? requestStatus = "Active" : requestStatus = "Inactive";
    

    // let postedOn = ethers.utils.formatUnits(timeStampPosted, 0);
    // let dueDate = ethers.utils.formatUnits(timeStampDue, 0);

    var date1 = new Date(timeStampPosted * 1000);
    var hours1 = date1.getHours();
    var minutes1 = "0" + date1.getMinutes();
    var seconds1 = "0" + date1.getSeconds();

    var fulldate1 = date1.getMonth() + "." + date1.getDay() + "." + date1.getFullYear();

  
    var date2 = new Date(timeStampDue * 1000);
    var hours2 = date2.getHours();
    var minutes2 = "0" + date2.getMinutes();
    var seconds2 = "0" + date2.getSeconds();

    var fulldate2 = date2.getMonth() + "." + date2.getDay() + "." + date2.getFullYear();

// Will display time in 10:30:23 format
var postedOnFinal = fulldate1 + " - " + hours1 + ':' + minutes1.substr(-2) + ':' + seconds1.substr(-2);
var dueDateFinal = fulldate2 + " - " + hours2 + ':' + minutes2.substr(-2) + ':' + seconds2.substr(-2);

// console.log(formattedTime);


    return(
        <>
        {requestData ? (
        <div key={props.id}>

            <h3><b>{requestText}</b></h3>
            <hr />
            <p>Posted by {requestOrigin}</p>
            <p>Bounty: {ethers.utils.formatUnits(bounty,0)} USDC</p>
            <p>Min. Reputation: {ethers.utils.formatUnits(reputation, 0)}</p>
            <p>Max. No. of Answers: {ethers.utils.formatUnits(maxAnswers, 0)}</p>
            <p>Posted on: {postedOnFinal}</p>
            <p>Due date: {dueDateFinal}</p>
            <p>Status: {requestStatus}</p>
            <br />
            <hr />
            <br />
            {/* <p><b>Answers:</b></p>
            <p>{requestData.answers[0].answer}</p>
            <p>Answered by: {requestData.answers[0].answerOrigin}</p>
            <p>Accepted Answer: {requestData.answers[0].acceptedAnswer}</p>
            <p>Upvotes: {requestData.answers[0].upVotes}</p>
            <p>Downvotes: {requestData.answers[0].downVotes}</p>
            <hr />
            <p>{requestData.answers[1].answer}</p>
            <p>Answered by: {requestData.answers[1].answerOrigin}</p>
            <p>Accepted Answer: {requestData.answers[1].acceptedAnswer}</p>
            <p>Upvotes: {requestData.answers[1].upVotes}</p>
            <p>Downvotes: {requestData.answers[1].downVotes}</p> */}

            <button className="px-4 py-1 text-sm text-red-600 font-semibold rounded-full border border-red-200 hover:text-white hover:bg-red-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2" onClick={() => console.log("clicked")}> Test Click</button>

        </div>

        ) : <></>}

    </>
    )
}

export default RequestCard;