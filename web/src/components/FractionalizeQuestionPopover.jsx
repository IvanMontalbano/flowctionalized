import {Popover} from "@headlessui/react"

export default function FractionalizeQuestionPopover() {
  return (
    <Popover className="relative flex flex-row-reverse w-80">
      <Popover.Button className="flex items-center justify-center w-10 h-10 border border-gray-200 rounded-full hover:opacity-80">
        <img
          src="/images/question.svg"
          alt="Questions?"
          width="10"
          height="12"
        />
      </Popover.Button>

      <Popover.Panel className="absolute z-10 w-full p-4 bg-white border border-gray-100 rounded-lg shadow-lg mt-14">
        <p>
          Welcome to fractionalization page. You can fractionalize you NFTs here, make sure them are not listed for sale.
        </p>
      </Popover.Panel>
    </Popover>
  )
}
