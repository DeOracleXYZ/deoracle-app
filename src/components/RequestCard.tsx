
function RequestCard(props) {


    const { requestData } = props;

    let requestStatus;

    if (requestData.active) {
        requestStatus = "Active";
    } else {
        requestStatus = "Inactive";
    }


    // console.log(props.requestData);

    // console.log(requests.requests[0]);
    // console.log(requests.requests[0].requestText);
    // console.log(requests.requests[0].requestOrigin);
    // console.log(requests.requests[0].bounty);
    // console.log(requests.requests[0].reputation);
    // console.log(requests.requests[0].maxAnswers);
    // console.log(requests.requests[0].timeStampPosted);
    // console.log(requests.requests[0].timeStampDue);
    // console.log(requests.requests[0].active);
    // console.log(requests.requests[0].timeStampDue);
    // console.log(requests.requests[0].answers);

      
    return(
        <div key={props.id}>
            <h3><b>{requestData.requestText}</b></h3>
            <hr />
            <p>Posted by {requestData.requestOrigin}</p>
            <p>Bounty: {requestData.bounty} USDC</p>
            <p>Min. Reputation: {requestData.reputation}</p>
            <p>Max. No. of Answers: {requestData.maxAnswers}</p>
            <p>Posted on: {requestData.timeStampPosted}</p>
            <p>Due date: {requestData.timeStampDue}</p>
            <p>Status: {requestStatus}</p>
            <br />
            <hr />
            <br />
            <p><b>Answers:</b></p>
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
            <p>Downvotes: {requestData.answers[1].downVotes}</p>



            <button className="px-4 py-1 text-sm text-red-600 font-semibold rounded-full border border-red-200 hover:text-white hover:bg-red-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2" onClick={() => console.log("clicked")}> Test Click</button>
        </div>
    )

}

export default RequestCard;