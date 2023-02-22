import Link from "next/link"
import {useRouter} from "next/router"
import PropTypes from "prop-types"
import {useEffect, useState} from "react"
import ListItems from "src/components/ListItems"
import MarketplaceFilters from "src/components/MarketplaceFilters"
import PageTitle from "src/components/PageTitle"
import Pagination from "src/components/Pagination"
import {CHAIN_ENV_TESTNET, paths} from "src/global/constants"
import useApiListings from "src/hooks/useApiListings"
import useAppContext from "src/hooks/useAppContext"
import {cleanObject} from "src/util/object"
import Avatar from "src/components/Avatar"
import ProfileAccountItems from "src/components/ProfileAccountItems"
import FractionalizeQuestionPopover from "src/components/FractionalizeQuestionPopover"
import publicConfig from "src/global/publicConfig"
import {Tab} from "@headlessui/react"
import {Fragment} from "react"
import ProfileListings from "src/components/ProfileListings"

const getTabClasses = selected =>
  `text-3xl mx-4 text-gray-darkest border-b-2 pb-0.5 hover:opacity-80 ${
    selected ? "border-green" : "border-transparent"
  }`
  
const PER_PAGE = 12

const MainContent = ({queryState}) => {
  const router = useRouter()

  const {currentUser} = useAppContext()
  const {listings, data} = useApiListings({
    ...queryState,
    marketplace: true,
  })
  const showPagination = data?.total !== undefined

  const updateQuery = (payload, scroll = true) => {
    const newQueryObject = {...queryState, ...payload}

    router.push(
      {
        pathname: router.pathname,
        query: cleanObject({
          ...newQueryObject,
          page: newQueryObject.page === 1 ? undefined : newQueryObject.page,
        }),
      },
      undefined,
      {
        scroll: scroll,
      }
    )
  }

  const onPageClick = (newPage, scroll) => updateQuery({page: newPage}, scroll)

  return (
    <div className="main-container py-14" data-cy="marketplace">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl text-gray-darkest">Fractionalize</h1>
        {/*!!currentUser && (
          <Link href={paths.profile(currentUser.addr)}>
            <a className="rounded uppercase font-bold text-sm rounded-full bg-green hover:opacity-80 py-2.5 px-5">
              List My Kitty Items
            </a>
          </Link>
        )*/}
      </div>

      <hr className="pt-1 mb-8" />

      {/*typeof queryState !== "undefined" && (
        <MarketplaceFilters queryState={queryState} updateQuery={updateQuery}>
          {showPagination && (
            <Pagination
              currentPage={queryState.page}
              total={data.total}
              perPage={PER_PAGE}
              onPageClick={newPage => onPageClick(newPage, false)}
            />
          )}
        </MarketplaceFilters>
        )*/}

      {!!listings && <ListItems items={listings} />}

      {showPagination && (
        <div className="flex items-center justify-center mt-16 py-6">
          <Pagination
            currentPage={queryState.page}
            total={data.total}
            perPage={PER_PAGE}
            onPageClick={onPageClick}
          />
        </div>
      )}
    </div>
  )
}

export default function Marketplace() {
  const router = useRouter();
  const {address} = router.query;
  const [queryState, setQueryState] = useState();

  useEffect(() => {
    if (router.isReady) {
      setQueryState({
        ...router.query,
        page: Number(router.query.page || 1),
      })
    }
  }, [router])

  return (
    <div className="main-container pt-12 pb-24" data-cy="profile">
      <PageTitle>Fractionalize</PageTitle>
      <main>
        <div className="bg-white border border-gray-200 p-6 mb-12 rounded-md flex flex-col items-center justify-center relative">
          <div className="absolute top-5 right-5 w-full flex flex-row-reverse">
            <FractionalizeQuestionPopover />
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
                  Fractionalized Items
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

MainContent.propTypes = {
  queryState: PropTypes.object,
}