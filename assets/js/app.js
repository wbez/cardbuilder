import '../less/app.less';
import React from 'react';
import ReactDOM from 'react-dom';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import sortBy from 'lodash/sortBy';

let BASE_GRAPHIC_URL = null;

if (DEPLOYMENT_TARGET === 'production') {
    BASE_GRAPHIC_URL = 'https://s3.amazonaws.com/wbez-dailygraphics/dailygraphics/graphics/cardbuilder-wireframe/child.html'
} else {
    BASE_GRAPHIC_URL = 'https://s3.amazonaws.com/wbez-stage-dailygraphics/dailygraphics/graphics/cardbuilder-wireframe/child.html'
}

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selections: [],
            title: '',
            subtitle: ''
        }
    }

    updateTitle = (title) => {
        this.setState({ title: title })
    }

    updateSubtitle = (subtitle) => {
        this.setState({ subtitle: subtitle })
    }

    updateSelections = (selection, action) => {
        let newSelections = this.state.selections.slice()

        if (action) {
            newSelections.push(selection)
        } else {
            const i = newSelections.indexOf(selection)
            newSelections.splice(i, 1)
        }

        const joinedids = this.joinIDs(newSelections)

        this.setState({
            selections: newSelections,
            ids: joinedids
        })
    }

    updateOrder = (selections) => {
        const joinedids = this.joinIDs(selections)

        this.setState({
            selections: selections,
            ids: joinedids
        })
    }

    joinIDs = (selections) => {
        let joinedids = ''

        for (let i = 0; i < selections.length; i++) {
            if (i === selections.length - 1) {
                var comma = false
            } else {
                var comma = true
            }

            joinedids = joinedids + selections[i].id.toString()
            joinedids = comma ? joinedids + ',' : joinedids
        }

        return joinedids
    }

    render() {
        return(
            <div>
                <Title update={this.updateTitle} key="Title"></Title>
                <Subtitle update={this.updateSubtitle} key="Subtitle"></Subtitle>
                <Categories update={this.updateSelections} key="Categories" />
                <SelectionList selections={this.state.selections} update={this.updateOrder} key="SelectionList" />

                { this.state.selections.length > 0 && this.state.title.length > 0 && this.state.subtitle.length > 0 ? <Embed ids={this.state.ids} title={this.state.title} subtitle={this.state.subtitle} key="Embed" /> : null }
                { this.state.selections.length > 0 && this.state.title.length > 0 && this.state.subtitle.length > 0 ? <EmbedCode ids={this.state.ids} title={this.state.title} subtitle={this.state.subtitle} key="EmbedCode" /> : null }
            </div>
        )
    }
}

class Title extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            'value': ''
        }

        this.update = this.update.bind(this)
    }

    update(e) {
        const newTitle = e.target.value
        this.setState({ value: newTitle })
        this.props.update(newTitle)
    }

    render() {
        return(
            <div className="row title-wrapper">
                <div className="row-label">
                    <h1>1. Title your stack</h1>
                </div>
                <div className="title row-interaction">
                    <input type="text" name="title" value={this.state.value} onChange={this.update} placeholder="Enter your title" />
                </div>
            </div>
        )
    }
}

class Subtitle extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            'value': ''
        }

        this.update = this.update.bind(this)
    }

    update(e) {
        const newSubtitle = e.target.value
        this.setState({ value: newSubtitle })
        this.props.update(newSubtitle)
    }

    render() {
        return(
            <div className="row subtitle-wrapper">
                <div className="row-label">
                    <h1>2. Subtitle your stack</h1>
                </div>
                <div className="subtitle row-interaction">
                    <textarea value={this.state.value} onChange={this.update} placeholder="Enter your subtitle" />
                </div>
            </div>
        )
    }
}

class Categories extends React.Component {
    constructor(props) {
        super(props)
    }

    update = (card, action) => {
        this.props.update(card, action)
    }

    render() {
        return(
            <div className="row categories-wrapper">
                <div className="row-label">
                    <h1>3. Select your cards</h1>
                </div>
                <div className="categories row-interaction">
                    {Object.keys(DATA).map(key => {
                        if (DATA[key].length > 0) {
                            return (
                                <CardList
                                    update={this.update}
                                    category={key}
                                    cards={DATA[key]}
                                    key={key}
                                />
                            )
                        }

                    })}
                </div>
            </div>
        )
    }
}

class CardList extends React.Component {
    constructor(props) {
        super(props)
    }

    updateCard = (card, action) => {
        this.props.update(card, action)
    }

    sortCards() {
        return sortBy(this.props.cards, function(c) {
            return c.title
        })
    }

    render() {
        return(
            <div className="category">
                <h2>{this.props.category}</h2>
                {this.sortCards().map((card) => (
                    <Card update={this.updateCard} key={card.id} card={card} />
                ))}
            </div>
        )
    }
}

class Card extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            checked: false
        }
    }

    toggle = e => {
        let checked = !this.state.checked
        this.setState({ checked })
        this.props.update(this.props.card, checked);
    }

    render() {
        return(
            <div className="card" id={this.props.card.id}>
                <p>
                        <input
                            id={this.props.card.title}
                            name={this.props.card.title}
                            type="checkbox"
                            checked={this.state.checked}
                            onClick={this.toggle}
                        />
                        <label htmlFor={this.props.card.title}>
                        {this.props.card.title}&nbsp;
                        <a target="_blank" href={`/admin/core/card/${this.props.card.id}/change`}>edit</a>
                        </label>
                </p>
            </div>
        )
    }
}

class SelectionList extends React.Component {
    constructor(props) {
        super(props)
    }

    onSortEnd = ({oldIndex, newIndex}) => {
        const updated = arrayMove(this.props.selections, oldIndex, newIndex)
        this.props.update(updated)
    };
    render() {
        return (
            <div className="row selection-wrapper">
                <div className="row-label">
                    <h1>4. Order your cards</h1>
                </div>
                <div className="row-interaction selection-list">
                    <SortableList selections={this.props.selections} onSortEnd={this.onSortEnd} lockAxis="y" helperClass="sorting"/>
                </div>
            </div>
        )
    }
}


const SortableItem = SortableElement(({value}) =>
    <li>{value.title}</li>
);

const SortableList = SortableContainer(({selections}) => {
  return (
    <div className="selections">
        { selections.length > 0 ?
            <ol>
              {selections.map((value, index) => (
                <SortableItem key={`item-${index}`} index={index} value={value} />
              ))}
            </ol> :
            'Select a card!'
        }

    </div>
  );
});

class Embed extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.initEmbed()
    }

    componentDidUpdate() {
        this.initEmbed()
    }

    initEmbed() {
        new pym.Parent(
            'card-embed',
            `${BASE_GRAPHIC_URL}?ids=${escape(this.props.ids)}&title=${escape(this.props.title)}&subtitle=${escape(this.props.subtitle)}`,
            {}
        )
    }

    render() {
        return (
            <div className="row embed-wrapper">
                <div className="row-label">
                    <h1>5. Preview your embed</h1>
                </div>
                <div className="row-interaction">
                    <div id="card-embed"></div>
                </div>
            </div>
        )
    }
}

class EmbedCode extends React.Component {
    constructor(props) {
        super(props)
    }

    embedCode() {
        console.log(this.props.ids);
        const composedId = 'cardbuilder-' + (this.props.ids).replace(/,/g,'-');
        return `<p data-pym-loader id="${composedId}" data-child-src='${BASE_GRAPHIC_URL}?ids=${escape(this.props.ids)}&title=${escape(this.props.title)}&subtitle=${escape(this.props.subtitle)}'>Loading...</p>
<script src="https://pym.nprapps.org/npr-pym-loader.v2.min.js" type="text/javascript"></script>`
    }

    render() {
        return (
            <div className="row embed-code-wrapper">
                <div className="row-label">
                    <h1>6. Copy the embed code</h1>
                </div>
                <div className="row-interaction">
                    <textarea readOnly rows="20" cols="80" value={this.embedCode()}>
                    </textarea>
                </div>
            </div>
        )
    }

}

ReactDOM.render(<App /> ,document.querySelector('#app'))
