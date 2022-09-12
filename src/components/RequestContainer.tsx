import RequestCard from './RequestCard';
import RequestCreate from './RequestCreate';


function RequestContainer(props: any) {
  const { account, requestList, id } = props;

  const requestCardList = () => {
    const requestEls = 
    requestList.map((card: any) => {
      let i = requestList.indexOf(card);
      return (
        <RequestCard key={id + i}
                      requestData = {card}
                      handleClick = {() => console.log("clicked!")} /> 
      )
    }
  );
  return requestEls;
}

    return(
        <div>
          <RequestCreate account = {account} />
          <br /><hr /><hr /><hr /><br />
          {requestList && requestCardList()}
        </div>
    )
}

export default RequestContainer;
