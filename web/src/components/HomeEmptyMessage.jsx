import {paths} from "src/global/constants"
import useAppContext from "src/hooks/useAppContext"
import Button, {ButtonLink} from "./Button"

export default function HomeEmptyMessage() {
  const {switchToAdminView} = useAppContext()
  return (
    <div
      className="flex justify-center my-12 text-center"
      data-cy="home-common"
    >
      <div className="bg-white border border-gray-200 p-6 w-[32rem] rounded-md inline-flex flex-col justify-center">
        <img
          src="/images/kitty-items-logo.svg"
          alt="Flowctionalize"
          width="100"
          className="mx-auto mt-6 mb-4"
        />
        <h1 className="text-3xl font-semibold">Welcome to Flowctionalize!</h1>
        <h3 className="text-xl font-semibold mb-6">
          A Flowctionalize Sample App
        </h3>

        <div className="bg-white border border-gray-200 p-6 rounded-md inline-flex flex-col justify-center">
          <b>Your marketplace is currently empty.</b>
          <p className="text-gray-light mb-5 mt-1">
            Get started by minting your first flowctionalize item!
          </p>

          <Button onClick={switchToAdminView}>
            MINT YOUR FIRST FLOWCTIONALIZE NFT SAMPLE
          </Button>
        </div>
      </div>
    </div>
  )
}
