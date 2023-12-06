import "@aws-amplify/ui-react/styles.css";
import {
  withAuthenticator,
  // Button,
  Heading,
  Image,
  View,
  Card,
} from "@aws-amplify/ui-react";
import React, { useEffect, useState } from 'react';
import './App.css';
import styled from 'styled-components';


// Styled components
const Body = styled.body`
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  margin: 0;
  padding: 0;
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
`;


const Block = styled.div`
  border: 1px solid #ddd;
  // background-color: #fff;
  background-color: ${(props) => (props.isSelected ? '#ecf0f1' : '#fff')};
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  width: 45%;
  margin: 0 20px; /* Adjust the margin value to your preference */

  h2 {
    color: #333;
  }

  p {
    color: #666;
  }
`;

const PromptBlock = styled.div`
  border: 1px solid #ddd;
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin-bottom: 10px;
  text-align: center;

  h2 {
    color: #333;
  }

  p {
    color: #666;
  }

`;

const Button = styled.button`
  display: block;
  width: 200px;
  margin: 20px auto;
  padding: 10px;
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #9b59b6;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* Fixed layout for percentage widths to work */

  th,
  td {
    border: 1px solid #ddd;
    text-align: left;
    padding: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    word-wrap: break-word;
  }

  th:first-child,
  td:first-child {
    width: 30%; /* Width for the first column */
  }

  th:last-child,
  td:last-child {
    width: 70%; /* Width for the second column */
  }

  th {
    background-color: #f2f2f2;
    font-weight: bold;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #f1f1f1;
  }
`;


const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #e6e6fa;
  color: white;
`;

const SignOutButton = styled.button`
  background-color: #8e44ad;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #9b59b6;
  }
`;

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


function App({ signOut, user }) {
  
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedPlannerType, setSelectedPlannerType] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [quizIDs, setQuizIDs] = useState([]);
  const [userPrefs, setUserPrefs] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [reachedEnd, setReachedEnd] = useState(false);
  
  
  const EndPage = () => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1 style={{ color: '#333', fontSize: '2em' }}>Thank You For Your Help ❤️</h1>
      <SignOutButton onClick={signOut}>Sign Out</SignOutButton>
      {/* Additional content for the end page */}
    </div>
  );

  
  function rec_poi_to_table(rec_pois){
    var res = [];
    for(const poi of rec_pois) {
      res.push( {name: poi["name"], filter_tags: poi["filter_tags"]} );
    }
    return res;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const quizData = await fetchUserQuiz(user?.username);
        var allBlocks = [];
        var allQuizIDs = [];
        var allUserPrefs = [];

        for (let i=0; i<quizData.length; i++){
          var origin_pois = rec_poi_to_table(quizData[i]["origin_result"]["rec_pois"]);
          var test_pois = rec_poi_to_table(quizData[i]["test_result"]["rec_pois"]);

          allQuizIDs.push(quizData[i]["quiz_id"])
          allUserPrefs.push(quizData[i]["test_result"]["user_pref"])
          
          if (getRandomInt(2) === 0) {
            allBlocks.push([
              {
                id: 'A',
                title: 'Recommendation A',
                pois: origin_pois.slice(0,20),
                planner_type: "origin"
              },
              {
                id: 'B', 
                title: 'Recommendation B',
                pois: test_pois.slice(0,20),
                planner_type: "test"
              }
            ])
          } else {
            allBlocks.push([
              {
                id: 'A',
                title: 'Recommendation A',
                pois: test_pois.slice(0,20),
                planner_type: "test"
              },
              {
                id: 'B', 
                title: 'Recommendation B',
                pois: origin_pois.slice(0,20),
                planner_type: "origin"
              }
            ])
          }

          // if (i === 0) {
          //   console.log(allBlocks);
          // }
        }

        setBlocks(allBlocks);
        setQuizIDs(allQuizIDs);
        setUserPrefs(allUserPrefs);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []); 


  function highlightSelection(id, planner_type) {
    setSelectedBlock(null);
    setSelectedPlannerType(null);
    setSelectedBlock(id);
    setSelectedPlannerType(planner_type);
  }

  function submitChoice(username) {
    if (selectedBlock) {
      // alert('You Selected ' + selectedBlock + "which is " + selectedPlannerType + " planner");
      saveUserSelection(); 
      nextBlock();
    } else {
      alert('Please select one option before submit');
    }
  }

  function nextBlock() {
    if (currentIdx < blocks.length - 1) {
      setCurrentIdx((prevIndex) => (prevIndex + 1));
      console.log(currentIdx);
    } else {
      setReachedEnd(true);
    }
  }

  function saveUserSelection(username) {
    if (selectedBlock){
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      var raw = JSON.stringify({"user_id": username, "quiz_id": quizIDs[currentIdx], "selected_block":selectedBlock, "selected_planner_type": selectedPlannerType});
      // create a JSON object with parameters for API call and store in a variable
      var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
      };
      // lambda function: dining-bm-ab-test-saving-selection
      fetch("https://zwth43egf3.execute-api.us-east-1.amazonaws.com/dev", requestOptions)
      .then(response => response.text())
      // .then(result => alert(JSON.parse(result).body))
      .catch(error => console.log('error', error));
    }
  }

  async function fetchUserQuiz(username) {
    //lambda function: dining-bm-ab-test-fetch-quiz
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({"user_id": username});
    // create a JSON object with parameters for API call and store in a variable
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    
    const url = "https://2ugdl7mz48.execute-api.us-east-1.amazonaws.com/dev";

    try {
      const response = await fetch(url, requestOptions);
      const result = await response.text();
      const parsed_result = JSON.parse(JSON.parse(result).body);

      // console.log(parsed_result);
      // console.log(parsed_result.origin);
      return parsed_result;
    } catch (error) {
        console.log('error', error);
        throw error;
    }
  }
  
  return (

      <div>
        {
          reachedEnd ? (
            <EndPage />
          ):(
            <Body>
              <HeaderContainer>
                <SignOutButton onClick={signOut}>Sign Out</SignOutButton>
              </HeaderContainer>

              <PromptBlock>
                <h2>Please select option A or B</h2>
                <p>Hi <b>{user?.username}</b>, we are testing our new knowledge-graph based algorithm for <b>tag-based</b> dining poi recommendation.</p>
                <p>
                  The goal is to recommend a list of dining POIs that best match the user selected preferences, based on the
                  relevance of tags.
                </p>
                <p>
                  For example, given user preference <b style={{ color: 'rgba(255,0,0,0.5)' }}>["Cupcake"]</b>, a dining POI
                  with tag <b style={{ color: 'rgba(31, 24, 245, 0.5)' }}>["Cheesecake"]</b> is a better match than the one
                  with <b style={{ color: 'rgba(31, 24, 245, 0.5)' }}>["Abalone"]</b>.
                </p>
                <p>Now the user preference is <b style={{ color: 'rgba(255,0,0,0.5)' }}>{JSON.stringify(userPrefs[currentIdx])}</b>, which one do
                  you think is better?</p>
              </PromptBlock>

              <Container>
              {
                // Rec A and B Block
                blocks[currentIdx]  && (blocks[currentIdx].map(
                    (block) => (
                      <Block
                        key={block.id}
                        id={`block${block.id}`}
                        class="block"
                        className={`block ${block.id === selectedBlock ? 'selected' : ''}`}
                        isSelected={block.id === selectedBlock}
                        onClick={() => highlightSelection(block.id, block.planner_type)}
                      >
                        <h2>{block.title}</h2>
                        <Table>
                          <thead> {/* Table head added here */}
                            <tr>
                              <th>Dining POI</th>
                              <th>Tags</th>
                            </tr>
                          </thead>
                          <tbody>
                            {block.pois.map((poi) => (
                              <tr key={poi.name}>
                                <td>{poi.name}</td>
                                <td>{JSON.stringify(poi.filter_tags)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Block>
                    )
                  )
                )
              }
              </Container>
                <Button onClick={ () => { submitChoice(user?.username); } }>Next</Button>
            </Body>
          )
        }
      </div>

  );
}

export default withAuthenticator(App);