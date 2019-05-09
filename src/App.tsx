import React, { Component } from "react";
import "./App.css";
import styled from "@emotion/styled";
import { display, height, space, width } from "styled-system";
import Table from "@material-ui/core/Table/Table";
import TableHead from "@material-ui/core/TableHead/TableHead";
import TableRow from "@material-ui/core/TableRow/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TableBody from "@material-ui/core/TableBody/TableBody";
import { faGithub } from "@fortawesome/free-brands-svg-icons/faGithub";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Subscription from "react-apollo/Subscriptions";
import { subscribeTransactions } from "./lib/graphql-subscription";
import ApolloProvider from "react-apollo/ApolloProvider";
import { parseResponseFromGraphQL, sortActions } from "./lib/response-parser";
import Grid from "@material-ui/core/Grid/Grid";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Cell,
  ResponsiveContainer
} from "recharts";
import { apolloClient } from "./lib/apollo-client";
import { ActionMap } from "./lib/models";


const Container: React.ComponentType<any> = styled.div`
  ${space};
  ${width};
  ${height};
  ${display};
`;

const GithubContainer: React.ComponentType<any> = styled.div`
  padding-left: 10px;
  &:hover{
    cursor: pointer;
  };
  &:hover path {
    color: #ff4660;
  };
`;

/**
 * React application implementing the average action rates widget using
 * the apollo client and dfuse apis
 * the subscription is bootstrapped by the 'renderSubscriber' method
 * coupled with the ApolloProvider (see main 'render()' method)
 * the packages material-ui and recharts are used for the table render and charts respectively
**/
class App extends Component<any, { topActions: string[] }> {
  actionsMap: ActionMap = {};
  actionsMapPoker  = [];
  interval: any = undefined;
  state = { topActions: [] };
  startTime = 0;
  startTimeString = "";
  endTime = 0;

  /**
  * setInterval throttles the render refresh
  * to increase both performance and user experience
  **/
  componentDidMount(): void {
    this.interval = setInterval(() => {
      const topActions = sortActions(this.actionsMap);
      this.setState({ topActions: topActions.slice(0, 50) });
    }, 3500);
  }


  get timeRange() {
    let timeRange = (this.endTime - this.startTime) / (60 * 1000);
    if (timeRange === 0) {
      timeRange = 1;
    }
    return timeRange;
  }

  /** Parses the data from payload and updates the timerange **/
  onSubscriptionData = ({ client, subscriptionData }: any) => {
    const response = subscriptionData.data.searchTransactionsForward;


    if (this.startTime === 0) {
      this.startTime = new Date(response.trace.block.timestamp).getTime();
      this.startTimeString = response.trace.block.timestamp;
    }
    this.endTime = new Date(response.trace.block.timestamp).getTime();

    this.actionsMapPoker = parseResponseFromGraphQL(
      this.actionsMapPoker,
      response.trace,
      response.undo
    );

    console.log(this.actionsMapPoker );

      let height = document.getElementsByClassName("App")[0].clientHeight
      window.parent.postMessage({"height": height}, "*")


  };

  /** RENDER Methods **/
  /** RENDER Methods **/
  renderActions(): JSX.Element[] {
    return this.actionsMapPoker.map((data: any, index: number) => {
      return (
          <TableRow key={index}>
            <TableCell>{data[3]}</TableCell>
            <TableCell>{data[1]}</TableCell>
            <TableCell>{data[2]}</TableCell>
            <TableCell>{data[4]}</TableCell>
            <TableCell>{data[5]}</TableCell>

          </TableRow>
      );
    });
  }

  renderLoading() {
    return <p>Loading...</p>;
  }

  renderSubscriber() {
    return <Subscription
      subscription={subscribeTransactions}
      variables={{ cursor: "", lowBlockNum: -100 }}
      onSubscriptionData={this.onSubscriptionData}
    />
  }

  renderWidgets() {
    const data = this.state.topActions.slice(0, 10).map((topAction: string) => {
      return {
        name: topAction.split(":")[0],
        value: Math.floor(this.actionsMap[topAction] / this.timeRange)
      };
    });

    return [

      <Container key="2">
        <Grid xs={12}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Act</TableCell>
                <TableCell>Table</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Bet</TableCell>
              </TableRow>
            </TableHead>
            <TableBody> {this.renderActions()} </TableBody>
          </Table>
        </Grid>
      </Container>
    ];
  }
  goToGithub() {
          window.top.location.href="https://github.com/dfuse-io/example-stream-action-rates"
  }
  render() {


    return (
      <div className="App">
        <ApolloProvider client={apolloClient}>
          {this.renderSubscriber()}
          <div>
            <h2 style={{ color: "#1c1e3e", paddingTop: "40px" }}>
              Pokerchained Live Actions Demo
            </h2>
            <h3 style={{ color: "#777", paddingTop: "20px" }}>
              Example React application using dfuse GraphQL API
              <GithubContainer style={{ display: "inline-block" }} onClick={this.goToGithub} >
                <FontAwesomeIcon icon={faGithub} color="#777"/>
              </GithubContainer>
            </h3>
          </div>
           {this.renderWidgets()  }
        </ApolloProvider>
      </div>
    );
  }
}

export default App;
