import requests from '../constants/requests'

function RequestCreate(props: any) {

    //logic
    const { account, requestList } = props;

    return(
        <div key={props.id}>


          <b>{account}</b>

          <br /><hr /><hr /><hr /><br />
          <div>NEW REQUEST</div>
          <br /><hr /><hr /><hr /><br />


        </div>
    )
}

export default RequestCreate;
