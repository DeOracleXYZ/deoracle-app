import { useState, useEffect } from "react";
import Image from "next/image";
import { usdcABI } from "../constants/abis";
import { BigNumber, Contract, ethers } from "ethers";
import Spline from "@splinetool/react-spline";

function RequestCreate(props: any) {
  const {
    account,
    provider,
    deOracleAddress,
    deOracleWRITE,
    setNotificationMessage,
    setNotificationError,
    setDisplayNotification,
  } = props;
  const [showMe, setShowMe] = useState(false);
  const daysAfterDueDate = 5;
  const [dueDate, setDueDate] = useState(
    addDays(new Date(Date.now()), daysAfterDueDate)
  );
  const [usdcContract, setUsdcContract] = useState(null as Contract | null);
  const [showApprove, setShowApprove] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [approved, setApproved] = useState(false);
  const [formData, setFormData] = useState({
    requestText: "",
    bounty: 0,
    reputation: 0,
    dueDate: "",
    dueDateUnix: 0,
  });

  const zone = new Date()
    .toLocaleTimeString("en-us", { timeZoneName: "short" })
    .split(" ")[2];

  useEffect(() => {
    provider &&
      setUsdcContract(
        new ethers.Contract(
          "0xFC07D8Ab694afF02301eddBe1c308Fe4a68F6121",
          usdcABI,
          provider.getSigner()
        )
      );
  }, [provider]);

  useEffect(() => {
    formData.bounty > 0 ? setShowApprove(true) : setShowApprove(false);
  }, [formData.bounty]);

  async function approveUSDC() {
    if (usdcContract) {
      const bountyInWei = ethers.utils.parseUnits(
        formData.bounty.toString(),
        18
      );
      let txReceipt;
      try {
        txReceipt = await usdcContract.approve(deOracleAddress, bountyInWei);
        setShowLoading(true);
        txReceipt = await txReceipt.wait();
      } catch (err: any) {
        setNotificationError(true);
        setNotificationMessage(err.reason);
        setDisplayNotification(true);
      }
      if (txReceipt && txReceipt.status === 1) {
        setShowLoading(false);
        setShowApprove(false);
        setApproved(true);
      } else {
        console.log("Approve tx Failed, check Metamask and try again.");
      }
    }
  }

  useEffect(() => {
    setFormData((prevFormData: any) => {
      return {
        ...prevFormData,
        requestOrigin: account,
        dueDate: dueDate,
      };
    });
  }, [account, setFormData]);

  function handleChange(event: any) {
    const { name, value, type, checked } = event.target;
    setFormData((prevFormData: any) => {
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

  async function sendRequest() {
    const { requestText, reputation, dueDateUnix, bounty } = formData;
    let txReceipt;
    let bountyInWei = ethers.utils.parseUnits(bounty.toString(), 18);

    if (deOracleWRITE)
      txReceipt = await deOracleWRITE.submitRequest(
        requestText,
        bountyInWei,
        reputation,
        dueDateUnix
      );
    setShowLoading(true);
    setDisableSubmit(true);
    txReceipt = await txReceipt.wait();

    if (txReceipt.status === 1) {
      setShowLoading(false);
      setDisableSubmit(false);

      setShowMe(false);
      setFormData({
        requestText: "",
        bounty: 0,
        reputation: 0,
        dueDate: "",
        dueDateUnix: 0,
      });

      toggle();

      refreshPage();
    } else {
      console.log("Approve tx Failed, check Metamask and try again.");
    }
  }

  function refreshPage() {
    window.location.reload();
  }

  function handleSubmit(event: any) {
    event.preventDefault();
    formData.dueDateUnix = timeToUnix(formData.dueDate);
    sendRequest();
  }

  function toggle() {
    setShowMe(!showMe);
  }

  return (
    <div className="w-full rounded-2xl mb-3 border-2 border-purple-300 text-black hover:border-purple-400 dark:border-purple-300/50 dark:hover:border-purple-400/50">
      <button
        className={
          `${showMe ? "hidden" : ""}` +
          " new-request-button w-full px-5 py-5 text-center text-purple-400 hover:text-purple-500 hover:bg-purple-100 dark:text-purple-400/80 dark:hover:text-purple-500/80 dark:hover:bg-purple-800/20"
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
          <button
            onClick={toggle}
            className="px-2 py-2 mt-3 hover:bg-purple-100/50 dark:hover:bg-purple-100/10 rounded-md"
          >
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
            <div className="grid grid-cols-2 gap-4 text-black dark:text-slate-400">
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
                    className="w-full mt-1 px-4 py-3 text-purple-500 rounded-lg border border-purple-300 hover:border-purple-400 dark:border-purple-300/50 dark:hover:border-purple-400/80 dark:bg-slate-900 focus:outline-purple-500 dark:focus:outline-purple-400/80 dark:focus:outline-none dark:focus:outline-2 placeholder:text-purple-300 dark:placeholder:text-purple-300/40"
                    style={{ outlineOffset: "0" }}
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
                  min="0"
                  className="inline w-full mt-1 px-4 py-3 mb-5 text-purple-500 rounded-lg border border-purple-300 hover:border-purple-400 dark:border-purple-300/50 dark:hover:border-purple-400/80 dark:bg-slate-900 focus:outline-purple-500 dark:focus:outline-purple-400/80 dark:focus:outline-none dark:focus:outline-2"
                  style={{ outlineOffset: "0" }}
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
                  min="0"
                  className="w-full mt-1 mb-5 px-4 py-3 rounded-lg border border-purple-300 text-purple-500 border-purple-300 hover:border-purple-400 dark:border-purple-300/50 dark:hover:border-purple-400/80 dark:bg-slate-900 focus:outline-purple-500 dark:focus:outline-purple-400/80 dark:focus:outline-none dark:focus:outline-2"
                  style={{ outlineOffset: "0" }}
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
                    className="w-full mt-1 px-4 py-3 text-purple-500 mb-5 rounded-lg border border-purple-300 hover:border-purple-400 dark:border-purple-300/50 dark:hover:border-purple-400/80 dark:bg-slate-900 focus:outline-purple-500 dark:focus:outline-purple-400/80 dark:focus:outline-none dark:focus:outline-2"
                    style={{ outlineOffset: "0" }}
                  />
                </div>
              </div>

              <div className="col-span-2">
                <button
                  type="button"
                  onClick={approveUSDC}
                  className={
                    `${showApprove ? "" : "hidden "}` +
                    `${approved ? "hidden " : ""}` +
                    " border drop-shadow-lg align-middle px-6 py-4 text-purple-600 dark:text-white/60 dark:hover:text-white/80 font-semibold rounded-full rounded-lg border-purple-400 bg-gradient-to-r from-purple-200 via-blue-200 to-purple-200 dark:from-purple-600/80 dark:via-blue-600/80 dark:to-purple-600/80 hover:border-purple-500 hover:text-purple-700 transition-all ease-in-out duration-500 bg-size-200 bg-pos-0 hover:bg-pos-100 disabled:opacity-60 my-3 mr-3"
                  }
                  disabled={showLoading}
                >
                  Approve {formData.bounty} USDC
                </button>

                <button
                  type="submit"
                  className="border drop-shadow-lg align-middle px-6 py-4 text-purple-600 dark:text-white/60 dark:hover:text-white/80 font-semibold rounded-full rounded-lg border-purple-400 bg-gradient-to-r from-purple-200 via-blue-200 to-purple-200 dark:from-purple-600/80 dark:via-blue-600/80 dark:to-purple-600/80 hover:border-purple-500 hover:text-purple-700 transition-all ease-in-out duration-500 bg-size-200 bg-pos-0 hover:bg-pos-100 disabled:opacity-60 my-3 mr-3"
                  disabled={showApprove || disableSubmit}
                >
                  Create Request
                </button>

                <div
                  className={
                    `${showLoading ? "" : "hidden"}` +
                    " inline whitespace-nowrap"
                  }
                >
                  <svg
                    className="animate-spin ml-1 mr-3 h-5 w-5 text-purple-400 inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-purple-600">Processing...</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="col-1 px-5 pt-8 pb-0 flex order-1 md:order-none place-content-center">
          {/* <Image
            style={{ zIndex: -1 }}
            className="self-center"
            src="eyeball.svg"
            alt="eyeball image"
            width={200}
            height={200}
          ></Image> */}

          {showMe && (
            <Spline
              scene="https://prod.spline.design/LBWVwdzF5oRbGik2/scene.splinecode"
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default RequestCreate;
