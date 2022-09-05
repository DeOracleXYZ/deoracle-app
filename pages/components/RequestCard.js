function RequestCard(props) {
    return(
        <div>
        <p>Requestor: Mark{props.color}</p>
        <p>Request: Who won the game?</p>
        <button onClick={() => props.handleClick()}> Test Click</button>
        </div>
    )
    

}

export default RequestCard;