import { useEffect, useState } from 'react';
import { Action, ActionPanel, List } from '@raycast/api';
import ItemForm from './views/item-form';


const Rsync = () => {
	// const [searchText, setSearchText] = useState('');
	// const [filteredList, filterList] = useState(items);
	//
	// useEffect(() => {
	// 	filterList(items.filter((item) => item.includes(searchText)));
	// }, [searchText]);



	return (
		<List
			enableFiltering={ false }
			// onSearchTextChange={ setSearchText }
			navigationTitle="rsync"
			searchBarPlaceholder=""
		>
				<List.Item title="Create new entry..." actions={
					<ActionPanel>
						<Action.Push
							title="Select"
							target={<ItemForm />}
						/>
					</ActionPanel>
				} />
				{/*<List.Section title="Saved items">*/}
				{/*	<List.Item title="Sierra Nevada IPA" />*/}
				{/*</List.Section>*/}
			{/*{ filteredList.map((item) => (
				<List.Item
					key={ item }
					title={ item }
					actions={
						<ActionPanel>
							<Action
								title="Select"
								onAction={ () => console.log(`${ item } selected`) }
							/>
						</ActionPanel>
					}
				/>
			)) }*/}
		</List>
	)
};

export default Rsync
