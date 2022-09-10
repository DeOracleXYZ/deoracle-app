import requests from '../constants/requests'
import RequestCard from './RequestCard';
import RequestCreate from './RequestCreate';

function RequestContainer(props: any) {

    //logic
    const { account, requestList } = props;


    return(
        <div key={props.id}>

          <RequestCreate id = "8008" 
                        account = {account} />

          <br /><hr /><hr /><hr /><br />

          <RequestCard id = "1" 
                       requestData = {requestList ? requestList[0] : ""}
                       handleClick={() => console.log("clicked!")} /> 

          <br /><hr /><hr /><hr /><br />

         <RequestCard id = "2" 
                       requestData = {requestList ? requestList[1] : ""} 
                       handleClick={() => console.log("clicked!")} /> 

          <br /><hr /><hr /><hr /><br />

           {/* <RequestCard id = "3" 
                       requestData = {requests.requests[1]} 
                       handleClick={() => console.log("clicked!")} /> 

          <br /><hr /><hr /><hr /><br /> */}


        </div>
    )
}

export default RequestContainer;
