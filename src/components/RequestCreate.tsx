import { useState, useEffect } from "react";
import Image from "next/image";
import { erc20ABI } from "../constants/abis";
import { Contract, ethers } from "ethers";

function RequestCreate(props: any) {
  const { handleClick, account, formData, updateFormData, provider, deOracleAddress } = props;
  const [showMe, setShowMe] = useState(false);
  const daysAfterDueDate = 5;
  const [dueDate, setDueDate] = useState(
    addDays(new Date(Date.now()), daysAfterDueDate)
  );
  const [usdcContract, setUsdcContract] = useState(null as Contract | null);
  const [showApprove, setShowApprove] = useState(false);
  const [showSubmit, setShowSubmit] = useState(true);
  const [showLoading, setShowLoading] = useState(false);


  const zone = new Date()
    .toLocaleTimeString("en-us", { timeZoneName: "short" })
    .split(" ")[2];

  useEffect(() => {
    provider &&
    setUsdcContract(new ethers.Contract('0xe11A86849d99F524cAC3E7A0Ec1241828e332C62', erc20ABI ,provider.getSigner()));
  }, [provider]);


  useEffect(() => {
    formData.bounty > 0
      ? setShowApprove(true)
      : setShowApprove(false)

  }, [formData.bounty, approveUSDC]);

  async function approveUSDC() {
    if (usdcContract){
  
      let txReceipt = await usdcContract.approve(deOracleAddress, ethers.utils.parseUnits(formData.bounty, 18))
      setShowLoading(true)
      txReceipt = await txReceipt.wait();
      setShowLoading(true)

      if(txReceipt.status === 1) {
        setShowLoading(false)
        // show Create Request button
        setShowApprove(false);
        setShowLoading(false)
        console.log("Tx success:", txReceipt.status === 1)
      

      } else {
        console.log("Approve tx Failed, check Metamask and try again.")
      }

    }

  }


  useEffect(() => {
    updateFormData((prevFormData: any) => {
      return {
        ...prevFormData,
        requestOrigin: account,
        dueDate: dueDate,
      };
    });
  }, [account, updateFormData]);

  function handleChange(event: any) {
    const { name, value, type, checked } = event.target;
    updateFormData((prevFormData: any) => {
      return {
        ...prevFormData,
        [name]: value,
      };
    });

    setDueDate(formData["dueDate"]);
  }

  function addDays(date: string | number | Date, days: number) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    let tLocal = result.toLocaleString("sv").replace(" ", "T").slice(0, 16);
    return tLocal;
  }

  function timeToUnix(date: any) {
    let dueDateUnix = new Date(date + ":00"); // "2011-10-10T14:48:00"
    let dueDateUnixFinal = Math.floor(dueDateUnix.getTime() / 1000);
    return dueDateUnixFinal;
  }

  function handleSubmit(event: any) {
    event.preventDefault();
    formData.dueDateUnix = timeToUnix(formData.dueDate)
    formData.bounty = ethers.utils.parseUnits(formData.bounty.toString(), 18)
    handleClick(formData);
  }

  function toggle() {
    setShowMe(!showMe);
  }

  return (
    <div className="w-full rounded-2xl mb-3 border-2 border-purple-300 text-black hover:border-purple-400">
      <button
        className={
          `${showMe ? "hidden" : ""}` +
          " new-request-button w-full px-5 py-5 text-center text-purple-400 hover:text-purple-500 hover:bg-purple-100"
        }
        onClick={toggle}
      >
        {" "}
        NEW REQUEST
      </button>

      <header
        className={
          `${!showMe ? "hidden" : ""}` +
          " w-full px-5 text-left grid grid-cols-2"
        }
      >
        <div className="col-1">
          <p className="new-request-header text-purple-500 text-xl md:text-2xl px-4 py-5">
            New Request
          </p>
        </div>

        <div className="col-1 text-right">
          <button onClick={toggle} className="px-2 py-2 mt-3 hover:bg-purple-100/50 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#c690ff"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="col-span-2">
          <hr />
        </div>
      </header>

      <div
        className={
          `${!showMe ? "hidden" : ""}` +
          " grid grid-cols-1 md:grid-cols-2 gap-4"
        }
      >
        <div className="order-2 md:order-none col-1 px-8 pt-0 pb-8 md:pt-8">
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
                    className="w-full mt-1 border border-purple-300 px-4 py-3 rounded-lg"
                  />
                </div>
              </div>

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
                  className="inline w-full mt-1 border border-purple-300 px-4 py-3 rounded-lg mb-5"
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

              <div className="col-span-2">
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

                <button type="button" onClick={approveUSDC} className={`${showApprove ? "" : "hidden"}` + " border px-1 py-2 align-middle px-6 py-3 text-purple-600 font-semibold rounded-full border-purple-400 bg-gradient-to-r from-purple-100 from-purple-300 hover:bg-gradient-to-l hover:border-purple-500 hover:text-purple-700 rounded-lg mr-3 mb-3"} disabled={showLoading}>Approve {formData.bounty} USDC</button>

                <button type="submit" className={`${showSubmit ? "" : "hidden"}` + " border px-1 py-2 align-middle px-6 py-3 text-purple-600 font-semibold rounded-full rounded-lg border-purple-400 bg-gradient-to-r to-purple via-blue from-purple-200 hover:border-purple-500 hover:text-purple-700 transition-all ease-in-out duration-500 bg-size-200 bg-pos-0 hover:bg-pos-100 disabled:opacity-60 mb-3 mr-3"} disabled={showApprove}>Create Request</button>

                <div className={`${showLoading ? "" : "hidden"}` + " inline no-wrap"}>
                  <svg className="animate-spin ml-1 mr-3 h-5 w-5 text-purple-400 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-purple-600">Processing...</span>
                </div>

              </div>
            </div>
          </form>
        </div>

        <div className="col-1 px-5 pt-8 pb-0 flex order-1 md:order-none place-content-center">
          <Image
            style={{ zIndex: -1 }}
            className="self-center"
            src="eyeball.svg"
            alt="eyeball image"
            width={200}
            height={200}
          ></Image>
        </div>
      </div>
    </div>
  );
}

export default RequestCreate;
