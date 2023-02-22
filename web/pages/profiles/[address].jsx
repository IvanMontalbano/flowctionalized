import {Tab} from "@headlessui/react"
import {useRouter} from "next/dist/client/router"
import Link from "next/link"
import {Fragment} from "react"
import Avatar from "src/components/Avatar"
import PageTitle from "src/components/PageTitle"
import ProfileAccountItems from "src/components/ProfileAccountItems"
import ProfileListings from "src/components/ProfileListings"
import ProfileQuestionPopover from "src/components/ProfileQuestionPopover"
import {CHAIN_ENV_TESTNET, paths} from "src/global/constants"
import publicConfig from "src/global/publicConfig"

const getTabClasses = selected =>
  `text-3xl mx-4 text-gray-darkest border-b-2 pb-0.5 hover:opacity-80 ${
    selected ? "border-green" : "border-transparent"
  }`

export default function Profile() {
  const router = useRouter()
  const {address} = router.query

  return (
    <div className="main-container pt-12 pb-24" data-cy="profile">
      <PageTitle>{address}</PageTitle>
      <main>
        <div className="bg-white border border-gray-200 p-6 mb-12 rounded-md flex flex-col items-center justify-center relative">
          <div className="absolute top-5 right-5 w-full flex flex-row-reverse">
            <ProfileQuestionPopover />
          </div>

          <div className="w-20 h-20 relative">
            <Avatar address={address} />
          </div>
          <div className="font-mono text-gray mt-2">
            {publicConfig.chainEnv === CHAIN_ENV_TESTNET ? (
              <Link href={paths.flowscanAcct(address)} passHref>
                <a className="hover:opacity-80" target="_blank">
                  {address}
                </a>
              </Link>
            ) : (
              address
            )}
          </div>
        </div>
        <Tab.Group>
          <Tab.List className="text-center mb-12">
            <Tab as={Fragment}>
              {({selected}) => (
                <button className={getTabClasses(selected)}>My Items</button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({selected}) => (
                <button className={getTabClasses(selected)}>
                  Listed Items
                </button>
              )}
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <ProfileAccountItems address={address} />
            </Tab.Panel>
            <Tab.Panel>
              <ProfileListings address={address} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </main>
    </div>
  )
}
