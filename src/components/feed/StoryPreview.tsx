import { graphql, useFragment } from 'react-relay'
import { StoryPreview_node$key } from '__generated__/StoryPreview_node.graphql'
import StoryPreviewFooter from './StoryPreviewFooter'
import UserSnippet from './UserSnippet'
import { GoKebabVertical } from '@react-icons/all-files/go/GoKebabVertical'
import Link from 'next/link'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from '../ErrorFallback'
import Card from '../Card'

type StoryPreviewProps = {
  story: StoryPreview_node$key
}

const StoryPreview = ({ story }: StoryPreviewProps) => {
  const data = useFragment(
    graphql`
      fragment StoryPreview_node on Story {
        id
        abstractContent
        thumbnail
        timeCreated
        title
        urlSuffix
        createdBy {
          ...UserSnippet_user
        }
        ...StoryPreviewFooter_story
      }
    `,
    story
  )

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Card classes="my-8 mr-2 flex flex-col ">
        <Link href={`/story/${data.id}___${data.urlSuffix}`}>
          <div>
            {data.thumbnail ? (
              <img className="cover-image" src={data.thumbnail} alt="" />
            ) : (
              <div className="image-placeholder bg-gray-100 dark:bg-dark-500" />
            )}
          </div>
          <div className="px-4 pb-4">
            <div className="flex flex-row justify-between">
              <UserSnippet user={data.createdBy} />
              <GoKebabVertical className="mt-4" />
            </div>
            <div className="prose dark:text-gray-100">
              <h3 className="dark:text-gray-200">{data.title}</h3>
              <p className="abstract-content">{data.abstractContent}</p>
            </div>
          </div>
        </Link>
        <StoryPreviewFooter story={data} />
        <style jsx>
          {`
            .image-placeholder {
              border-radius: 0.5rem 0.5rem 0 0;
              content: '';
              height: 4rem;
            }
            .cover-image {
              border-radius: 0.5rem 0.5rem 0 0;
              max-height: 10rem;
              width: 100%;
              object-fit: cover;
            }

            .abstract-content {
              text-overflow: ellipsis;
              overflow: hidden;
              // Addition lines for 2 line or multiline ellipsis
              display: -webkit-box !important;
              -webkit-line-clamp: 4;
              -webkit-box-orient: vertical;
              white-space: normal;
            }
          `}
        </style>
      </Card>
    </ErrorBoundary>
  )
}

export default StoryPreview
