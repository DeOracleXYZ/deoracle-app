import RequestCard from './RequestCard';
import RequestCreate from './RequestCreate';


function RequestContainer(props: any) {

    //logic
    const { account, requestList, id } = props;
    let requestCardList;

  
    if (requestList) {
      requestCardList = requestList.map((card: any) => {
        let i = requestList.indexOf(card);
        return (
          <div key={i}>
            <RequestCard id = {i}
                         requestData = {card}
                         handleClick = {() => console.log("clicked!")} /> 
          </div>
        )
      });
    }


    return(
        <div key={id}>

          <RequestCreate id = "8008" 
                        account = {account} />

          <br /><hr /><hr /><hr /><br />

          {requestCardList ? requestCardList : "" }

        
        </div>
    )
}

export default RequestContainer;
