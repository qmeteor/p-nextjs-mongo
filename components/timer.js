/**
 * Created by Bien on 2018-01-18.
 */
import Link from 'next/link'
import { connect } from 'react-redux'
import Clock from './clock'
import AddCount from './addcount'

export default connect(state => state)(({ title, linkTo, lastUpdate, light }) => {

    return (
        <div>
            <Clock lastUpdate={lastUpdate} light={light} />
            {/*<AddCount />*/}
            <nav>
                <Link href={linkTo}><a>Navigate</a></Link>
            </nav>
        </div>
    )
})