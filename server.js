const noble = require('@abandonware/noble');
const asTable = require('as-table');

noble.on('stateChange', async (state) => {
    if (state === 'poweredOn') {
        await noble.startScanningAsync();
    }
});

async function devDesc(peripheral) {
    const desc = await peripheral.discoverAllServicesAndCharacteristicsAsync();

    console.log("\n\nServices\n");
    console.log(asTable(desc.services.map(e => {
        return { uuid: e.uuid, name: e.name, type: e.type };
    })));
    console.log("\n\nChars\n");
    console.log(asTable(desc.characteristics.map(e => {
        return { uuid: e.uuid, name: e.name, type: e.type };
    })));
}

async function watchDesc(peripheral) {

    const desc = await peripheral.discoverAllServicesAndCharacteristicsAsync();//await peripheral.discoverSomeServicesAndCharacteristicsAsync([], ["2a25", "2a27", "2a28", "2a23", "2a50"]);
    console.log("Discovered");
    for (char of desc.characteristics) {
        if (["2a25", "2a27", "2a28", "2a50"].includes(char.uuid)) {
            const data = await char.readAsync();
            console.log(`${char.name}: ${data.toString()}`);
        }
        if (["2a2b"].includes(char.uuid)) {
            const data = await char.readAsync();
            const year = data.readInt16LE();
            const month = data.readInt8(2);
            const day = data.readInt8(3);
            const hour = data.readInt8(4);
            const min = data.readInt8(5);
            const sec = data.readInt8(6);
            console.log(`${char.name}: ${year}-${month}-${day} ${hour}:${min}:${sec}`);
        }
        if (["2a37", "2a39"].includes(char.uuid)) {
            const data = await char.readAsync();
            console.log(`${char.name}: `, data);
        }
    }
}

noble.on('discover', async (peripheral) => {
    if (peripheral.id === '35fca8750a214fcfbe72d815a25266c1') {
        console.log("AMAZFIT", peripheral.id, peripheral.advertisement);
        await noble.stopScanningAsync();
        console.log("Connect");
        await peripheral.connectAsync();
        console.log("Do");
        await devDesc(peripheral);
        await watchDesc(peripheral);
        await peripheral.disconnectAsync();
    }
});