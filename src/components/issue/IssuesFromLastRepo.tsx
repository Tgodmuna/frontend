import React, { useCallback, useEffect } from 'react'
import { graphql, usePaginationFragment } from 'react-relay'
import { IssuesFromLastRepo$key } from '__generated__/IssuesFromLastRepo.graphql'
import { FaChevronRight } from '@react-icons/all-files/fa/FaChevronRight'
import Issue from './Issue'

type IssuesFromLastRepoProps = {
  user: IssuesFromLastRepo$key
}

const IssuesFromLastRepo = ({ user }: IssuesFromLastRepoProps) => {
  const { data, loadNext, hasNext } = usePaginationFragment(
    graphql`
      fragment IssuesFromLastRepo on User
      @refetchable(queryName: "IssuesFromLastRepo_Query")
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 4 }
        cursor: { type: "String" }
      ) {
        issuesFromLastRepo(first: $count, after: $cursor)
          @connection(key: "IssuesFromLastRepo__issuesFromLastRepo") {
          edges {
            node {
              id
              ...Issue_node
            }
          }
        }
      }
    `,
    user
  )

  const scrollableElement = React.useRef<HTMLDivElement>(null)

  enum scrollDirection {
    Left = -1,
    Right = 1,
  }

  const scrollHorizontally = useCallback((direction: scrollDirection) => {
    scrollableElement.current &&
      (scrollableElement.current.scrollLeft += direction * 550)
  }, [])

  const handleScrollRight = () => {
    if (hasNext) {
      loadNext(4)
    }
    scrollHorizontally(scrollDirection.Right)
  }

  useEffect(() => {
    scrollHorizontally(scrollDirection.Right)
  }, [data.issuesFromLastRepo.edges, scrollHorizontally, scrollDirection.Right])

  if (!data || data.issuesFromLastRepo.edges.length === 0) {
    return null
  }

  return (
    <div className="mt-10">
      <h3 className="font-bold text-gray-500 text-lg">Issues from last repo</h3>
      <div className="flex">
        <div
          className="grid grid-rows-2 grid-flow-col gap-4 flex-1 overflow-x-auto auto-cols-max no-scrollbar scroll-smooth"
          ref={scrollableElement}
        >
          {data.issuesFromLastRepo.edges.map(
            (issue) => issue && <Issue issue={issue.node} key={issue.node.id} />
          )}
        </div>
        <div className="flex flex-col ml-2 h-full">
          <button
            type="button"
            className=" right-8 bottom-0 mr-4 mt-4"
            onClick={() => scrollHorizontally(scrollDirection.Left)}
          >
            <FaChevronRight className="b-0 w-6 h-6 rotate-180 dark:text-gray-300 bg-gray-300 dark:bg-dark-900 rounded-full p-1 font-bold" />
          </button>
          <button
            type="button"
            className=" right-0 bottom-0 mr-4 mt-4"
            onClick={() => handleScrollRight()}
          >
            <FaChevronRight className="b-0 w-6 h-6 dark:text-gray-300 bg-gray-300 dark:bg-dark-900 rounded-full p-1 font-bold" />
          </button>
        </div>
      </div>
      <style jsx>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none;
          }
        `}
      </style>
    </div>
  )
}

export default IssuesFromLastRepo
