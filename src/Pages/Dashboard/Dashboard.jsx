import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { setClientsList, setCredits } from '../../redux/reducers';
import './Dashboard.css'
import { deleteClientApi, getClientListApi, activeStatusApi, transactionsApi, updateCreditApi, updatePasswordApi } from '../../services/api';
import Sidebar from '../../Components/Sidebar/SideBar';
import NavBar from '../../Components/NavBar/Navbar';


const Dashboard = () => {

  const navigate = useNavigate()

  useSelector((state) => console.log("stt", state))

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user)
  const clientList = useSelector((state) => state.clientList)

  const emptyDetails = {
    userName: "",
    password: "",
    clientNickName: "",
    credits: 0
  }

  const [isUpdateCredit, setIsUpdateCredit] = React.useState(false);
  const [openDelete, setOpenDelete] = useState(false)
  const [openHistory, setOpenHistory] = React.useState(false);
  const [isUpdatePassword, setIsUpdatePassword] = useState(false)
  const [details, setDetails] = useState(emptyDetails)
  const [history, setHistory] = useState([])
  var [userNameVar, setuserNameVar] = useState("")
  const [addOrRedeemeCredits, setAddOrRedeemeCredits] = useState(1)
  const [initialcredits, setInitialCredits] = useState(0)
  var [filteredClient, setFilteredClient] = useState([])



  const handleSubmit = async (e) => {
    e.preventDefault()
  }

  const handleChangeFormDetails = (formdata) => {
    setDetails({ ...details, ...formdata })
  }

  const updateCredit = async () => {
    if (addOrRedeemeCredits > 0) {
      var finalCredit = user.credits - details.credits;
      if ((user.designation != 'company')) {
        if (finalCredit < 0) {
          alert("you have not enough balance to credit")
          return
        }
      }
    } else {

      if ((initialcredits - details.credits) < 0) {
        alert("Your client have not enough balance to redeeme")
        return
      }
    }

    const response = await updateCreditApi({ ...details, credits: addOrRedeemeCredits * (details.credits) })

    if (addOrRedeemeCredits > 0) {
      if (response) {
        dispatch(setCredits(finalCredit))
        getClientList();
      }
    } else {
      if (response) {
        getClientList();
      }
    }
    setIsUpdateCredit(false)
    setDetails(emptyDetails)
  }

  const updatePassword = async () => {

    if (details.password !== details.confirmNewpassword) {
      alert("Password is not matching")
      return
    }
    const response = await updatePasswordApi({ ...details, clientUserName: details.userName, userName: user.userName })
    setIsUpdatePassword(false)
  }

  const handleDelete = async () => {
    setOpenDelete(false)
    const response = await deleteClientApi({ clientUserName: userNameVar, userName: user.userName, designation: user.designation })
    if (response)
      getClientList();
  }

  const handleDeleteModal = (userNameVar) => {
    setuserNameVar(userNameVar)
    setOpenDelete(true)
  }

  const getClientList = async () => {
    console.log("getClientListFun")
    const response = await getClientListApi({ userName: user.userName })
    dispatch(setClientsList(response.data.clientList))
  }

  const handleTransactions = async (userName) => {
    const response = await transactionsApi({ clientUserName: userName, userName: user.userName })
    setHistory(response.data)
    setOpenHistory(true)
  }

  const handleUpdatePassword = (items) => {
    setIsUpdatePassword(true)
    setDetails(items)
  }

  const addCredits = (items, addOrRedeeme) => {
    setIsUpdateCredit(true)
    setAddOrRedeemeCredits(addOrRedeeme)
    setDetails(items)
    setInitialCredits(items.credits)
    setDetails({ ...items, clientUserName: items.userName, userName: user.userName, initialcredits, credits: 0 })
  }

  const handleActiveInactive = async (items) => {
    console.log("activity", items.activeStatus)
    const response = await activeStatusApi({ clientUserName: items.userName, userName: user.userName, activeStatus: items.activeStatus })
    if (response)
      getClientList()
  }

  const filterClients = (searchText) => {
    setFilteredClient(
      clientList.filter(items => items.userName.includes(searchText))
    )
  }

  const handleCompanyClick = async (row) => {
    if(user.designation=="company"){
      const response = await getClientListApi({ userName: row.userName })
      setFilteredClient(response.data.clientList)
    }
  }

  useEffect(() => {
    setFilteredClient(clientList)
  }, [clientList])

  useEffect(() => {
    if (!user.userName)
      navigate("/")
    getClientList()
  }, [])

  return (
    <div className="companyDashboardBody">
      <NavBar />
      <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
        <div className='isSideBarShow'>
            <Sidebar/>
        </div>

        <div className="companyUserView">
          <div className='firstCompnayUserViewColumn'>
            <input className='search' type='text' placeholder='Search' onChange={(e) => filterClients(e.target.value)} />
          </div>

          <div className='thirdCompnayUserViewColumn'>
            <table className="companyTable" >
              <tr className="companyTableCell">
                <th className="companyTableCellHeader">User Name</th>
                <th className="companyTableCellHeader">NickName</th>
                <th className="companyTableCellHeader">Credits</th>
                <th className="companyTableCellHeader">Buttons</th>
              </tr>

              {filteredClient.map((row, index) => (
                <tr className="companyTableCell" key={row.name}>
                  <td className="companyTableCellDataUserName" onClick={() => handleCompanyClick(row)}>{row.userName}</td>
                  <td className="companyTableCellData">{row.nickName ? row.nickName : "N/A"}</td>
                  <td className="companyTableCellData">{row.credits}</td>

                  <td className="companyTableCellDataButtonContainer">
                    <div className="companyTableCellDataButtons" >
                      <button className="companyTableCellDataButtonContainerButton deleteButton upper" onClick={() => handleDeleteModal(row.userName)}>Delete</button>
                      <button className="companyTableCellDataButtonContainerButton upper" onClick={() => handleTransactions(row.userName)}>Transactions</button>
                      <button className="companyTableCellDataButtonContainerButton upper" style={{ backgroundColor: row.activeStatus ? "green" : "red" }} onClick={() => handleActiveInactive(row)}>{`${row.activeStatus ? "Enabled" : "Disabled"}`} </button>
                    </div>
                    <div className="companyTableCellDataButtons " >
                      {row.designation == "master" && < button className="companyTableCellDataButtonContainerButton lower" onClick={() => addCredits(row, -1)}>Redeem Credits</button>}
                      <button className="companyTableCellDataButtonContainerButton lower " onClick={() => handleUpdatePassword(row)}>Update Password</button>
                      {row.designation == "master" && <button className="companyTableCellDataButtonContainerButton lower" onClick={() => addCredits(row, 1)}>Add Credits</button>}

                    </div>
                  </td>
                </tr>
              ))}
            </table>
          </div>
        </div>
      </div>


      {isUpdateCredit &&
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="closeButton" onClick={() => setIsUpdateCredit(false)}>&times;</div>
            <form className="form" onSubmit={(e) => handleSubmit(e)}>
              <div style={{ color: "black" }}>{`UserName : ${details.userName}`}</div>

              <br />
              <div style={{ color: "black" }}>
                NickName : {`${details.nickName} `}
              </div>
              <br />
              <div style={{ color: "black" }}>
                Initial Credits : {`${details.initialcredits} `}
              </div>
              <label>
                {`${(addOrRedeemeCredits > 0) ? "Add Credit : " : "Redeeme Credits : "}`}
                <input type='text' value={details.credits} onChange={(e) => handleChangeFormDetails({ credits: e.target.value.trim() })} />

              </label>
              <br />
              <button type='submit' onClick={() => updateCredit()}> {`${(addOrRedeemeCredits > 0) ? "Add Credit" : "Redeeme Credits"}`} </button>
            </form>
          </div>
        </div>}

      {isUpdatePassword &&
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="closeButton" onClick={() => setIsUpdatePassword(false)}>&times;</div>
            <form className="form" onSubmit={(e) => handleSubmit(e)}>
              <div style={{ color: "black" }}>{`UserName : ${details.userName}`}</div>
              <div style={{ color: "black" }}>
                NickName : {`${details.nickName} `}
              </div>
              <br />
              <label>
                {`Enter New Password`}
                <input type='text' value={details.password} onChange={(e) => handleChangeFormDetails({ password: e.target.value.trim() })} />

              </label>
              <br />
              <label>
                {`Confirm New Password`}
                <input type='text' value={details.confirmNewpassword} onChange={(e) => handleChangeFormDetails({ confirmNewpassword: e.target.value.trim() })} />
              </label>
              <button type='submit' onClick={() => updatePassword()}>Update Password</button>
            </form>
          </div>
        </div>}

      {openDelete &&
        <div className="modal-overlay">
          <div className="modal-content">
            <div>
              <h5 style={{ color: "black" }}> Are you sure want to delete</h5>
              <button onClick={() => handleDelete()}>Yes</button>
              <button onClick={() => setOpenDelete(false)}>No</button>
            </div>
          </div>
        </div>}

      {openHistory &&
        <div className="modal-overlay">
          <div className="modal-content-history">
            <div className="closeButton" onClick={() => setOpenHistory(false)}>&times;</div>
            <table className="historyTable">
              <tr className="tableCell">
                <td className="tableCellData">Credior</td>
                <td className="tableCellData">Debitor</td>
                <td className="tableCellData">Credits</td>
                <td className="tableCellData">Time</td>
              </tr>
              {history.map((row) => (
                <tr className="tableCell" key={row.name}>
                  <td className="tableCellData">{row.creditor}</td>
                  <td className="tableCellData">{row.debitor}</td>
                  <td className="tableCellData">{row.credit}</td>
                  <td className="tableCellData">{`${row.createdAtDate},${row.createdAtTime}`}</td>
                </tr>
              ))}
            </table>
          </div>
        </div>}
    </div>
  )
}

export default Dashboard