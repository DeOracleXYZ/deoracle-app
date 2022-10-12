export default function Notification(props) {
  const { notificationError, notificationMessage, setDisplayNotification } =
    props;
  return (
    <div
      className={
        `${notificationError ? "bg-red-400/90" : "bg-green-400/90"}` +
        " fixed max-w-lg border border-white/20 px-1 py-1 top-3 left-3 rounded-lg drop-shadow-xl flex items-stretch items-center " +
        `${notificationMessage ? "" : "hidden"}`
      }
      style={{ zIndex: 999999 }}
    >
      <div className="inline px-5 py-1 flex items-center justify-center">
        {notificationError ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>
      <div className="inline pr-5 pl-2 py-1">
        {notificationError ? (
          <div>
            <p className="font-bold">Error!</p>
            <p>{notificationMessage}</p>
          </div>
        ) : (
          <div>
            <p className="font-bold">Success!</p>
            <p>{notificationMessage}</p>
          </div>
        )}
      </div>
      <button
        type="button"
        className={
          `${
            notificationError
              ? "hover:bg-red-300/40 active:bg-red-300/20"
              : "hover:bg-green-300/40 active:bg-green-300/20"
          }` +
          " inline px-5 py-5 border-l border-black/20 rounded-r-md opacity-70 hover:opacity-100"
        }
        onClick={() => setDisplayNotification(false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
