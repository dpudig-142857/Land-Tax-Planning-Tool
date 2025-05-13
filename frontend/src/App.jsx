import { useState } from "react";
import "./App.css";

function App() {
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState("")
  const [newBeneficiary, setNewBeneficiary] = useState("None")
  const [landholders, setLandHolders] = useState([])
  const [beneficiaries, setBeneficiaries] = useState([])
  const [newAddress, setNewAddress] = useState("")
  const [newValue, setNewValue] = useState(0)
  const [newPPR, setNewPPR] = useState("")
  const [newOwners, setNewOwners] = useState("")
  const [extraProperty, setExtraProperty] = useState("")
  const [extraOwner, setExtraOwner] = useState("")
  const [properties, setProperties] = useState([])
  const [calculated, setCalculated] = useState("")
  const [taxes, setTaxes] = useState([])
  const [deletedLandholder, setDeletedLandholder] = useState("")
  const [deletedProperty, setDeletedProperty] = useState("")

  const individual = "Individual"
  const trust = "Trust"
  const company = "Company"

  const addLandholder = async (e, currName, currType, currBeneficiary) => {
    e.preventDefault()

    if (currName == "") return
    if (currType == "") return
    for (let i = 0; i < landholders.length; i++) {
      if (landholders[i].name == currName) return
    }

    let newLandholder = {
      name: currName,
      type: currType,
      beneficiary: currBeneficiary,
      ownedProperties: [],
      taxableProperties: []
    }
    
    let currLandholders = landholders
    currLandholders.push(newLandholder)
    setLandHolders(currLandholders)

    if (currType != trust) { 
      let currBeneficiaries = beneficiaries
      currBeneficiaries.push(newLandholder)
      setBeneficiaries(currBeneficiaries)
    }

    setNewName("")
    setNewType("")
    setNewBeneficiary("None")

    fetch("http://localhost:8000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        landholders, beneficiaries, properties, taxes
      })
    })
      .catch((error) => {
        console.log(error)
      })
  }

  const deleteLandholder = async (e, index) => {
    e.preventDefault()

    if (index == -1) return
    
    let newLandholders = []
    let deletedLandholder = null
    for (let i = 0; i < landholders.length; i++) {
      if (i == index) {
        deletedLandholder = landholders[i]
      } else {
        newLandholders.push(landholders[i])
      }
    }
    setLandHolders(newLandholders)

    let newBeneficiaries = []
    for (let i = 0; i < landholders.length; i++) {
      if (i != index && landholders[i].type != trust) {
        newBeneficiaries.push(landholders[i])
      }
    }
    setBeneficiaries(newBeneficiaries)

    let newProperties = []
    for (let i = 0; i < properties.length; i++) {
      let newProperty = properties[i]
      let currOwners = newProperty.owners
      let addProperty = true
      if (currOwners.length == 1) {
        if (currOwners[0] == deletedLandholder.name) addProperty = false
      } else {
        let newOwners = []
        let newOwnerString = ""
        for (let j = 0; j < currOwners.length; j++) {
          if (currOwners[j] != deletedLandholder.name) {
            newOwners.push(currOwners[j])
            if (j != 0) newOwnerString += ", "
            newOwnerString += currOwners[j]
          }
        }
        newProperty.owners = newOwners
        newProperty.ownerString = newOwnerString
      }
      if (addProperty) newProperties.push(newProperty)
    }
    setProperties(newProperties)

    setDeletedLandholder("")

    fetch("http://localhost:8000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        landholders, beneficiaries, properties, taxes
      })
    })
      .catch((error) => {
        console.log(error)
      })
  }

  const addProperty = async (e, currAddress, currValue, currPPR, currOwner) => {
    e.preventDefault()

    if (currAddress == "") return
    if (currValue < 0) return
    if (currPPR == "") return
    if (currOwner == "") return

    let newProperty = {
      address: currAddress,
      value: currValue,
      ppr: currPPR,
      ownerString: currOwner,
      owners: [currOwner]
    }

    let currLandholders = landholders
    for (let i = 0; i < landholders.length; i++) {
      if (landholders[i].name == currOwner) {
        if (currPPR == "No") {
          if (currLandholders[i].type == trust) {
            let newName = currLandholders[i].beneficiary
            if (newName == "None") {
              currLandholders[i].taxableProperties.push(newProperty)
            } else {
              for (let j = 0; j < landholders.length; j++) {
                if (landholders[j].name == newName) {
                  currLandholders[j].taxableProperties.push(newProperty)
                }
              }
            }
          } else {
            currLandholders[i].taxableProperties.push(newProperty)
          }
        }
        currLandholders[i].ownedProperties.push(newProperty)
      }
    }
    setLandHolders(currLandholders)
    
    let currProperties = properties
    currProperties.push(newProperty)
    setProperties(currProperties)

    setNewAddress("")
    setNewValue(0)
    setNewPPR("")
    setNewOwners("")

    fetch("http://localhost:8000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        landholders, beneficiaries, properties, taxes
      })
    })
      .catch((error) => {
        console.log(error);
      })
  }

  const deleteProperty = async (e, index) => {
    e.preventDefault()

    if (index == -1) return
    
    let newProperties = []
    let deletedProperty = null
    for (let i = 0; i < properties.length; i++) {
      if (i == index) {
        deletedProperty = properties[i]
      } else {
        newProperties.push(properties[i])
      }
    }
    setProperties(newProperties)

    let newLandholders = []
    for (let i = 0; i < landholders.length; i++) {
      let curr = landholders[i]
      let newOwnedProperties = []
      for (let j = 0; j < curr.ownedProperties.length; j++) {
        if (curr.ownedProperties[j].address != deletedProperty.address) {
          newOwnedProperties.push(curr.ownedProperties[j])
        }
      }
      let newTaxableProperties = []
      for (let j = 0; j < curr.taxableProperties.length; j++) {
        if (curr.taxableProperties[j].address != deletedProperty.address) {
          newTaxableProperties.push(curr.taxableProperties[j])
        }
      }
      curr.ownedProperties = newOwnedProperties
      curr.taxableProperties = newTaxableProperties
      newLandholders.push(curr)
    }
    setLandHolders(newLandholders)

    setDeletedProperty("")

    fetch("http://localhost:8000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        landholders, beneficiaries, properties, taxes
      })
    })
      .catch((error) => {
        console.log(error)
      })
  }

  const addExtraOwners = async (e, property, extraOwner) => {
    e.preventDefault()

    if (property < 0 || property >= properties.length) return
    if (extraOwner == "") return

    let currOwners = properties[property].owners
    for (let i = 0; i < currOwners.length; i++) {
      if (currOwners[i] == extraOwner) return
    }

    let currProperties = properties
    currProperties[property].ownerString += ", " + extraOwner
    currProperties[property].owners.push(extraOwner)
    setProperties(currProperties);

    let currLandholders = landholders
    for (let i = 0; i < currLandholders.length; i++) {
      if (currLandholders[i].name == extraOwner) {
        currLandholders[i].ownedProperties.push(properties[property])
      }
    }
    setLandHolders(currLandholders)

    setExtraProperty("")
    setExtraOwner("")

    fetch("http://localhost:8000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        landholders, beneficiaries, properties, taxes
      })
    })
      .catch((error) => {
        console.log(error);
      })
  }

  const calculate = async (e) => {
    e.preventDefault()

    if (landholders.length == 0 || properties.length == 0) return
    setCalculated("True")

    let currTaxes = []
    for (let i = 0; i < landholders.length; i++) {
      let totalOwnership = 0
      let totalTaxable = 0
      
      for (let j = 0; j < landholders[i].ownedProperties.length; j++) {
        totalOwnership += parseInt(landholders[i].ownedProperties[j].value)
      }

      for (let j = 0; j < landholders[i].taxableProperties.length; j++) {
        if (landholders[i].taxableProperties[j].ppr == "No") {
          totalTaxable += parseInt(landholders[i].taxableProperties[j].value)
        }
      }

      currTaxes.push({
        name: landholders[i].name,
        type: landholders[i].type,
        ownership: totalOwnership,
        taxable: totalTaxable
      })
    }
    setTaxes(currTaxes)

    fetch("http://localhost:8000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        landholders, beneficiaries, properties, taxes
      })
    })
      .catch((error) => {
        console.log(error);
      })
  }
  
  return (
    <main>
      <h1 className="bigHeader">Land tax planning tool</h1>
      <h3 className="landholdersHeader">Who are the landholders?</h3>
      <h5 className="landholdersSubHeader">In the case of a trust you may choose to nominate a beneficiary or select none.</h5>

      <form className="landholderForm" action="" onSubmit={(e) => addLandholder(e, newName, newType, newBeneficiary)}>
        <input
          className="landholderName"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <select className="landholderType" value={newType} onChange={(e) => setNewType(e.target.value)}>
          <option value="" selected hidden>Select Type</option>
          <option value="Individual">Individual</option>
          <option value="Trust">Trust</option>
          <option value="Company">Company</option>
        </select>
        <select
          className={newType == trust ? "landholderBeneficiary" : "landholderHidden"}
          value={newBeneficiary}
          onChange={(e) => setNewBeneficiary(e.target.value)}
        >
          <option value="None" selected>None</option>
          {beneficiaries && beneficiaries.length ? beneficiaries.map((beneficiary) => (
            <option value={beneficiary.name}>{beneficiary.name}</option>
          )) : ""}
        </select>
        <button className="landholderSubmit">
          Add Landholder
        </button>
      </form>

      <table className="landholderTable">
        <tr>
          <th>Names</th>
          <th>Types</th>
          <th>Beneficiary</th>
        </tr>
        {landholders && landholders.length ? landholders.map((landholder) => (
          <tr>
            <td>{landholder.name}</td>
            <td>{landholder.type}</td>
            <td>{landholder.type == trust ? (
              landholder.beneficiary != "" ? landholder.beneficiary : "None"
            ) : ""}</td>
          </tr>
        )) : ""}
      </table>

      <form className="deleteLandholderForm" action="" onSubmit={(e) => deleteLandholder(e, deletedLandholder)}>
        <select
          className="deleteLandholder"
          value={deletedLandholder}
          onChange={(e) => setDeletedLandholder(e.target.value)}
        >
          <option value="" selected hidden>Select Landholder</option>
          {landholders && landholders.length ? landholders.map((landholder, index) => (
            <option value={index}>{landholder.name}</option>
          )) : ""}
        </select>
        <button className="deleteLandholderSubmit">
          Delete Landholder
        </button>
      </form>

      <hr></hr>

      <h3 className="propertiesHeader">Enter the address of the property, the land value (not including structures), and select the owner. If this is the Principal Place of Residence please select Yes in the PPR box</h3>
      
      <form className="propertyForm" action="" onSubmit={(e) => addProperty(e, newAddress, newValue, newPPR, newOwners)}>
        <input
          className="propertyAddress"
          placeholder="Address"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
        />
        <input
          className="propertyValue"
          type="number"
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
        />
        <select
          className="propertyOwner"
          value={newOwners}
          onChange={(e) => setNewOwners(e.target.value)}
        >
          <option value="" selected hidden>Select Owner</option>
          {landholders && landholders.length ? landholders.map((landholder) => (
            <option value={landholder.name}>{landholder.name}</option>
          )) : ""}
        </select>
        <select
          className="propertyPPR"
          value={newPPR}
          onChange={(e) => setNewPPR(e.target.value)}
        >
          <option value="" selected hidden>PPR</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        <button className="propertySubmit">
          Add Property
        </button>
      </form>

      <table className="propertyTable">
        <tr>
          <th>Address</th>
          <th>Value</th>
          <th>Owner</th>
          <th>PPR</th>
        </tr>
        {properties && properties.length ? properties.map((property) => (
          <tr>
            <td>{property.address}</td>
            <td>${property.value}</td>
            <td>{property.ownerString}</td>
            <td>{property.ppr}</td>
          </tr>
        )) : ""}
      </table>

      <form className="deletePropertyForm" action="" onSubmit={(e) => deleteProperty(e, deletedProperty)}>
        <select
          className="deleteProperty"
          value={deletedProperty}
          onChange={(e) => setDeletedProperty(e.target.value)}
        >
          <option value="" selected hidden>Select Property</option>
          {properties && properties.length ? properties.map((property, index) => (
            <option value={index}>{property.address}</option>
          )) : ""}
        </select>
        <button className="deletePropertySubmit">
          Delete Property
        </button>
      </form>

      <h5 className="extraOwnerHeader">Note: That if you add an extra owner for a property, joint ownership will not be assessed
as a separate taxpayer from the individuals, nor will it calculate credits available.
For joint ownership please contact us or seek advice.</h5>

      <form className="extraOwnerForm" action="" onSubmit={(e) => addExtraOwners(e, extraProperty, extraOwner)}>
        <select
          className="extraOwnerProperty"
          value={extraProperty}
          onChange={(e) => setExtraProperty(e.target.value)}
        >
          <option value="" selected hidden>Select Property</option>
          {properties && properties.length ? properties.map((property, index) => (
            <option value={index}>{property.address}</option>
          )) : ""}
        </select>
        <select
          className="extraOwner"
          value={extraOwner}
          onChange={(e) => setExtraOwner(e.target.value)}
        >
          <option value="" selected hidden>Select Owner</option>
          {landholders && landholders.length ? landholders.map((landholder) => (
            <option value={landholder.name}>{landholder.name}</option>
          )) : ""}
        </select>
        <button className="extraOwnerSubmit">
            Add extra owner
        </button>
      </form>

      <form className="calculateForm" action="" onSubmit={(e) => calculate(e)}>
        <button className="calculate">
            Calculate
        </button>
      </form>

      <table className={calculated == "True" ? "taxTable" : "hideTaxTable"}>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Total land ownership</th>
          <th>Taxable value</th>
        </tr>
        {taxes && taxes.length ? taxes.map((tax) => (
          <tr>
            <td>{tax.name}</td>
            <td>{tax.type}</td>
            <td>${tax.ownership}</td>
            <td>${tax.taxable}</td>
          </tr>
        )) : ""}
      </table>

    </main>
  );
}

export default App;
