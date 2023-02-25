import PropTypes from "prop-types"
import {fetchFLOWFictitiousBalance} from "src/flow/script.get-flow-fictitious-balance"
import {fmtFlow} from "src/util/fmt-flow"
import useSWR from "swr"

export default async function useFLOWFictitiousBalance(address) {
  const data = await fetchFLOWFictitiousBalance(address)
  .then(res => {
    console.log("res =>", res)
    return res
  })

  return {
    dataFict: typeof data === "undefined" ? undefined : fmtFlow(data),
    isLoading: typeof data === "undefined",
  }
}

useFLOWFictitiousBalance.propTypes = {
  address: PropTypes.string,
}
