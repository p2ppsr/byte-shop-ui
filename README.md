# Byteshop UI

a user interface for the [Byte Shop API Server](https://github.com/p2ppsr/byte-shop).

A Stageline ("testnet") deployment of the master branch is available at [https://staging-byte-shop-ui.babbage.systems](https://staging-byte-shop-ui.babbage.systems).

Cool Bytes can be purchased if you have a [CoolCert](https://github.com/p2ppsr/coolcert) certificate.

## Setting Up

Clone the repo, then run:

```
npm i
npm run start
```

Then, your UI will be available on port **3000**.

## License

The license for the code in this repository is the Open BSV License.


## October2026 Node build security maintenance

Retained build tooling uses Node22.23.4 and the existing frozen dependency lock.
Historical npm6 peer resolution is retained. PR CI verifies the patched native
Node/Brotli runtime and builds the retained source; registry fetches are bounded
and failures remain failures. Application dependency versions and browser
contracts are unchanged. The obsolete Cloud Run deployment is retained only as
a non-executable reference at `docs/legacy-cloud-run-deploy.yaml.txt`. This source
update cannot recreate that legacy Cloud Run service. A working build does not
establish application or production-restoration acceptance.
