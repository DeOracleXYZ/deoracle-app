import requests from '../constants/requests'
import RequestCard from './RequestCard';

function RequestContainer(props) {

    //logic
    const { account, requestList } = props;
    if(account) console.log(account);


    console.log(123);
    console.log(requestList);

    return(
        <div key={props.id}>


          <b>{props.account}</b>

          <br /><hr /><hr /><hr /><br />

          <RequestCard id = "1" 
                       requestData = {requests.requests[0]} 
                       handleClick={() => console.log("clicked!")} /> 

          <br /><hr /><hr /><hr /><br />

          <RequestCard id = "2" 
                       requestData = {requests.requests[1]} 
                       handleClick={() => console.log("clicked!")} /> 

          <br /><hr /><hr /><hr /><br />


        </div>
    )
}

export default RequestContainer;
