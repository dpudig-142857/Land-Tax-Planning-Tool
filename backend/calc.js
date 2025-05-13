import express from "express"
import bodyParser from "body-parser"
import cors from "cors"

const app = express()
const port = 8000
app.use(bodyParser.json())
app.use(cors());

app.post("/", async (request, response) => {
    const { landholders, beneficiaries, properties, taxes } = request.body

    if (landholders != null) {
        for (let i = 0; i < landholders.length; i++) {
            console.log("Landholder " + i + ": ")
            console.log("name = " + landholders[i].name)
            console.log("type = " + landholders[i].type)
            console.log("beneficiary = " + landholders[i].beneficiary)
            if (landholders[i].ownedProperties.length == 0) {
                console.log("no owned properties")
            } else {
                for (let j = 0; j < landholders[i].ownedProperties.length; j++) {
                    console.log("owned property " + j + " = " + landholders[i].ownedProperties[j].address)
                }
            }
            if (landholders[i].taxableProperties.length == 0) {
                console.log("no taxable properties")
            } else {
                for (let j = 0; j < landholders[i].taxableProperties.length; j++) {
                    console.log("taxable property " + j + " = " + landholders[i].taxableProperties[j].address)
                }
            }
            console.log("\n")
        }
    } else {
        console.log("landholders = null");
    }
    console.log("-".repeat(25));
    if (beneficiaries != null) {
        for (let i = 0; i < beneficiaries.length; i++) {
            console.log("Beneficiaries " + i + ": ")
            console.log("name = " + beneficiaries[i].name)
            console.log("type = " + beneficiaries[i].type)
            console.log("beneficiary = " + beneficiaries[i].beneficiary + "\n")
        }
    } else {
        console.log("beneficiaries = null");
    }
    console.log("-".repeat(25));
    if (properties != null) {
        for (let i = 0; i < properties.length; i++) {
            console.log("Property " + i + ": ")
            console.log("address = " + properties[i].address)
            console.log("value = " + properties[i].value)
            console.log("ppr = " + properties[i].ppr)
            console.log("ownerString = " + properties[i].ownerString)
            for (let j = 0; j < properties[i].owners.length; j++) {
                console.log("owner " + j + " = " + properties[i].owners[j])
            }
            console.log("\n")
        }
    } else {
        console.log("properties = null");
    }
    console.log("-".repeat(25));
    if (taxes != null) {
        for (let i = 0; i < taxes.length; i++) {
            console.log("Tax " + i + ": ")
            console.log("name = " + taxes[i].name)
            console.log("type = " + taxes[i].type)
            console.log("ownership = " + taxes[i].ownership)
            console.log("taxable = " + taxes[i].taxable + "\n")
        }
    } else {
        console.log("taxes = null");
    }
    console.log("-".repeat(50))

    response.json({
        output: landholders, beneficiaries, properties, taxes
    })
})

app.listen(port, () => {
    console.log("current port = " + port);
});

