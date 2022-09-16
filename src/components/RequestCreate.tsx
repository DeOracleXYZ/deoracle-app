import { useState, useEffect } from "react";
import Image from "next/image";

function RequestCreate(props: any) {
  
  const { handleClick, account, formData, updateFormData } = props;
  const [showMe, setShowMe] = useState(false);
  const daysAfterDueDate = 5;
  const [dueDate, setDueDate] = useState( addDays(new Date( Date.now() ), daysAfterDueDate) );
  const [dueDateUnix, setDueDateUnix] = useState(timeToUnix(dueDate));
  

  useEffect( () => {
    updateFormData((prevFormData: any) => {
        return {
            ...prevFormData,
            requestOrigin: account,
            postedDate: unixStamp,
            dueDate: dueDate,
            dueDateUnix: dueDateUnix,
        }
    })
  }, [account, dueDateUnix])

  useEffect( () => {
    setDueDateUnix( timeToUnix(dueDate) );

  }, [dueDate])

  function handleChange(event: any) {
    const {name, value, type, checked} = event.target
    updateFormData((prevFormData: any) => {
        return {
            ...prevFormData,
            [name]: type === "checkbox" ? checked : value
        }
    })

    setDueDate( formData['dueDate'] )
  }


  // Get local timezone (long and short)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  var zone = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2];

  // Get local date
  const date = new Date( Date.now() );

  // convert to unix stamp
  const unixStamp = Math.floor(date.getTime() / 1000);

  // convert date string to Data object
  // console.log(parseInt( Date.parse("2011-10-10T14:48:00.000+09:00").toString() ));

  // reconstruct date from unix stamp
  const dateObject = new Date(unixStamp * 1000);

  // print date based on local timezone
  const humanReadableDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'long', timeZone: timezone }).format(dateObject);
  console.log(humanReadableDate);

  function addDays(date: string | number | Date, days: number) {
    let result = new Date(date)
    result.setDate(result.getDate() + days)
    let tLocal = result.toLocaleString('sv').replace(' ', 'T').slice(0, 16)
    return tLocal
  }

  function timeToUnix (date: any) {
    let dueDateUnix = new Date( date + ":00" ); // "2011-10-10T14:48:00"
    let dueDateUnixFinal = Math.floor( dueDateUnix.getTime() / 1000);
    return dueDateUnixFinal;
  }

  console.log(addDays(date, daysAfterDueDate)); // 2002-11-11T11:01



  function handleSubmit(event: any) {
    event.preventDefault()
    handleClick(formData)
    console.log(formData)
  } 

  function toggle() {
    setShowMe(!showMe)
  }


  return (
    <div className="w-full rounded-2xl mb-3 border-2 border-purple-300 text-black hover:border-purple-400">
      <button className={`${showMe ? "hidden" : ""}` +
          " new-request-button w-full px-5 py-5 text-center text-purple-400 hover:text-purple-500 hover:bg-purple-100"
        } onClick={toggle}> NEW REQUEST</button>

      <header className={
          `${!showMe ? "hidden" : ""}` +
          " w-full px-5 text-left grid grid-cols-2"
        } >
        <div className="col-1">
          <p className="new-request-header text-purple-500 text-2xl px-4 py-5">New Request</p>
        </div>

        <div className="col-1 text-right">
          <button onClick={toggle} className="px-4 pt-5 pb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#c690ff"
              className="w-8 h-8"
            >
              <path strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="col-span-2">
          <hr />
        </div>
      </header>

      <div className={`${!showMe ? "hidden" : ""}` + " grid grid-cols-2 grid-flow-col gap-4"}>
        <div className="col-1 px-8 py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="mb-2">
                  <label className="pl-2">
                    <b>Request:</b>
                  </label>
                  <br />
                  <textarea
                    name="requestText"
                    value={formData.requestText}
                    onChange={handleChange}
                    placeholder="Type in your request..."
                    required
                    minLength={10}
                    rows={4}
                    className="w-full mt-1 border border-purple-300 px-4 py-3  rounded-lg"
                  />
                </div>
              </div>

              <div className="col-1">
                <div className="col-1">
                  <label className="pl-2">
                    <b>Bounty (USDC):</b>
                  </label>
                  <br />
                  <input
                    type="number"
                    name="bounty"
                    value={formData.bounty}
                    onChange={handleChange}
                    required
                    placeholder="i.e. 100"
                    minLength={1}
                    className="w-full mt-1 border border-purple-300 px-4 py-3 rounded-lg  mb-5"
                  />
                </div>

                <div className="col-1">
                  <label className="pl-2">
                    <b>Min. Reputation (RP):</b>
                  </label>
                  <br />
                  <input
                    type="number"
                    name="reputation"
                    value={formData.reputation}
                    onChange={handleChange}
                    required
                    placeholder="i.e. 100"
                    minLength={1}
                    className="w-full mt-1 border border-purple-300 px-4 py-3  rounded-lg border-purple-300 mb-5"
                  />
                </div>
              </div>

              <div className="col-1">
                <div className="col-1">
                  <label className="pl-2">
                    <b>Max. No. of Answers:</b>
                  </label>
                  <br />
                  <input
                    type="number"
                    name="maxAnswers"
                    value={formData.maxAnswers}
                    onChange={handleChange}
                    required
                    placeholder="i.e. 1"
                    minLength={1}
                    className="w-full mt-1 border border-purple-300 px-4 py-3 rounded-lg mb-5"
                  />
                </div>

                <div className="col-1">
                  <label className="pl-2">
                    <b>Due Date ({zone}):</b>
                  </label>
                  <br />
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 border border-purple-300 px-4 py-3 rounded-lg mb-5"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <button
                  type="submit"
                  className="border px-1 py-2 align-middle px-6 py-3 text-purple-600 font-semibold rounded-full border-purple-400 bg-gradient-to-r from-purple-100 from-purple-300 hover:bg-gradient-to-l hover:border-purple-500 hover:text-purple-700 rounded-lg"
                >
                  Create Request
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="col-1 px-5 py-5 flex place-content-center">
          <Image
            style={{ zIndex: -1 }}
            className="self-center"
            src="eyeball.svg"
            alt="eyeball image"
            width={300}
            height={300}
          ></Image>
        </div>
      </div>
    </div>
  );
}

export default RequestCreate;
