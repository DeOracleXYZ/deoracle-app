function RequestCreate(props: any) {
  return (
    <div>
      <div
        className="new-request-button w-full px-5 py-5 text-center border-2 border-purple-300 text-purple-300 text-xxl hover:text-purple-400  hover:border-purple-400 hover:bg-purple-100"
        onClick={() => console.log("New Request!")}
      >
        NEW REQUEST
      </div>
    </div>
  );
}

export default RequestCreate;
