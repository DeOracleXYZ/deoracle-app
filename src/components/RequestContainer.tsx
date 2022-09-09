import requests from '../constants/requests'
import RequestCard from './RequestCard';

function RequestContainer(props) {

    //logic
    const { request, bounty, minReputation, postDate, dueDate } = props;



    return(

        <div key={props.id}>
          <RequestCard id="1" color="red" handleClick={() => console.log("clicked!")}/> 
          <RequestCard id="2" color="blue" handleClick={() => console.log("clicked!")}/> 
          <RequestCard id="3" color="green" handleClick={() => console.log("clicked!")}/> 
          <RequestCard id="6" color="orange"/>
            Test Container
        </div>

    )
}

export default RequestContainer;
