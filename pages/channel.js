import 'isomorphic-fetch'
import Layout from '../components/Layout'
import ChannelGrid from '../components/ChannelGrid'
// import PodcastList from '../components/PodcastList'
import PodcastListWithClick from '../components/PodcastListWithClick'
import PodcastPlayer from '../components/PodcastPlayer'
import Error from './_error'

export default class extends React.Component {
  constructor(props) {
    super()
    this.state = {
      openPodcast: null
    }
  }
  static async getInitialProps({ query, res }) {
    let idChannel = query.id

    try {
      let [reqChannel, reqSeries, reqAudios] = await Promise.all([
        fetch(`https://api.audioboom.com/channels/${idChannel}`),
        fetch(`https://api.audioboom.com/channels/${idChannel}/child_channels`),
        fetch(`https://api.audioboom.com/channels/${idChannel}/audio_clips`)
      ])
      if(reqChannel.status >= 400 ) {
        res.statusCode = reqChannel.status
        return { channel: null, audioClips: null, series: null, statusCode: reqChannel.status }
      }
      let dataChannel = await reqChannel.json()
      let channel = dataChannel.body.channel
  
      let dataAudios = await reqAudios.json()
      let audioClips = dataAudios.body.audio_clips
  
      let dataSeries = await reqSeries.json()
      let series = dataSeries.body.channels
      return { channel, audioClips, series, statusCode: reqChannel.status, mensaje: null}
    } catch (error) {
      console.log('error')
      console.log(error)
      res.statusCode = 503
      return { channel: null, audioClips: null, series: null, statusCode: 503, mensaje: error}
    }
   
  }
  openPodcast = (event, podcast ) => {
    event.preventDefault()
    this.setState({
      openPodcast: podcast
    })
  }
  closePodcast = (e) => {
    e.preventDefault()
    this.setState({
      openPodcast: null
    })
  }
  render() {
    const { channel, audioClips, series,  statusCode, mensaje} = this.props
    const { openPodcast } = this.state
    console.log({statusCode})
    console.log({mensaje})

    if(statusCode !== 200) {
      return <Error statusCode={statusCode} />
    }
    return <Layout title={channel.title} image={channel.urls.banner_image.original} description={channel.description} >
      <div
        className="banner"
        style={{ backgroundImage: `url(${channel.urls.banner_image.original})` }}
      />
      
      {openPodcast && <div className='modal'>
        <PodcastPlayer clip={openPodcast} onClose={this.closePodcast} />
        </div>}
      <h1>{ channel.title }</h1>

      { series.length > 0 &&
        <div>
          <h2>Series</h2>
          <ChannelGrid channels={series}/>
        </div>
      }

      <h2>Ultimos Podcasts</h2>
      <PodcastListWithClick podcasts={audioClips} onClickPodcast={this.openPodcast} />

      <style jsx>{`
        .banner {
          width: 100%;
          padding-bottom: 25%;
          background-position: 50% 50%;
          background-size: cover;
          background-color: #aaa;
        }

        h1 {
          font-weight: 600;
          padding: 15px;
        }
        h2 {
          padding: 5px;
          font-size: 0.9em;
          font-weight: 600;
          margin: 0;
          text-align: center;
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: black;
          z-index: 99999;
        }
      `}</style>
    </Layout>
  }
}