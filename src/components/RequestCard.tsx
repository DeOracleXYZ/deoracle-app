
function RequestCard(props) {
      
    return(
        <div>
        <p>Requestor: Mark {props.color}</p>
        <p>Request: Who won the game?</p>
        <button className="px-4 py-1 text-sm text-red-600 font-semibold rounded-full border border-red-200 hover:text-white hover:bg-red-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2" onClick={() => console.log("clicked")}> Test Click</button>
        </div>
    )

}

export default RequestCard;