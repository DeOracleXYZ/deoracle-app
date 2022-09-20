import { useState, useEffect } from "react";
import Image from "next/image";
import { Contract, ethers } from "ethers";

function RequestCreate(props: any) {
  const { handleClick, account, formData, updateFormData, provider, deOracleAddress } = props;
  const [showMe, setShowMe] = useState(false);
  const daysAfterDueDate = 5;
  const [dueDate, setDueDate] = useState(
    addDays(new Date(Date.now()), daysAfterDueDate)
  );
  const[usdcContract, setUsdcContract] = useState(null as Contract | null);

  const zone = new Date()
    .toLocaleTimeString("en-us", { timeZoneName: "short" })
    .split(" ")[2];

  useEffect(() => {
    provider &&
    setUsdcContract(new ethers.Contract('0xe11A86849d99F524cAC3E7A0Ec1241828e332C62',[
      {
          "constant": true,
          "inputs": [],
          "name": "name",
          "outputs": [
              {
                  "name": "",
                  "type": "string"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": false,
          "inputs": [
              {
                  "name": "_spender",
                  "type": "address"
              },
              {
                  "name": "_value",
                  "type": "uint256"
              }
          ],
          "name": "approve",
          "outputs": [
              {
                  "name": "",
                  "type": "bool"
              }
          ],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [],
          "name": "totalSupply",
          "outputs": [
              {
                  "name": "",
                  "type": "uint256"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": false,
          "inputs": [
              {
                  "name": "_from",
                  "type": "address"
              },
              {
                  "name": "_to",
                  "type": "address"
              },
              {
                  "name": "_value",
                  "type": "uint256"
              }
          ],
          "name": "transferFrom",
          "outputs": [
              {
                  "name": "",
                  "type": "bool"
              }
          ],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [],
          "name": "decimals",
          "outputs": [
              {
                  "name": "",
                  "type": "uint8"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [
              {
                  "name": "_owner",
                  "type": "address"
              }
          ],
          "name": "balanceOf",
          "outputs": [
              {
                  "name": "balance",
                  "type": "uint256"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [],
          "name": "symbol",
          "outputs": [
              {
                  "name": "",
                  "type": "string"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": false,
          "inputs": [
              {
                  "name": "_to",
                  "type": "address"
              },
              {
                  "name": "_value",
                  "type": "uint256"
              }
          ],
          "name": "transfer",
          "outputs": [
              {
                  "name": "",
                  "type": "bool"
              }
          ],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [
              {
                  "name": "_owner",
                  "type": "address"
              },
              {
                  "name": "_spender",
                  "type": "address"
              }
          ],
          "name": "allowance",
          "outputs": [
              {
                  "name": "",
                  "type": "uint256"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "payable": true,
          "stateMutability": "payable",
          "type": "fallback"
      },
      {
          "anonymous": false,
          "inputs": [
              {
                  "indexed": true,
                  "name": "owner",
                  "type": "address"
              },
              {
                  "indexed": true,
                  "name": "spender",
                  "type": "address"
              },
              {
                  "indexed": false,
                  "name": "value",
                  "type": "uint256"
              }
          ],
          "name": "Approval",
          "type": "event"
      },
      {
          "anonymous": false,
          "inputs": [
              {
                  "indexed": true,
                  "name": "from",
                  "type": "address"
              },
              {
                  "indexed": true,
                  "name": "to",
                  "type": "address"
              },
              {
                  "indexed": false,
                  "name": "value",
                  "type": "uint256"
              }
          ],
          "name": "Transfer",
          "type": "event"
      }
  ],provider.getSigner()));
  }, [provider]);

  async function approveUSDC() {
    await usdcContract!.approve(deOracleAddress, ethers.utils.parseUnits(formData.bounty, 18))
  }


  useEffect(() => {
    updateFormData((prevFormData: any) => {
      return {
        ...prevFormData,
        requestOrigin: account,
        dueDate: dueDate
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
          <button onClick={toggle} className="px-4 pt-5 pb-3">
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
                <button type="button" className="inline" onClick={approveUSDC}>Approve</button>
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
